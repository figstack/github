import { Probot, Context } from "probot";
import axios from 'axios';
import { BACKEND_ENDPOINT, FRONTEND_ENDPOINT } from './constants';
const SOURCE_GITHUB = 'github';

const parseCode = (ogCode: string) => {
  const trimmedCode = ogCode.trim();
  const lines = trimmedCode.split('\n');
  lines.splice(0,1);

  const parsedLines = lines.map((line) => {
    const firstCharacter = line.charAt(0);
    if (firstCharacter === '-' || firstCharacter === '+') {
      return line.substring(1);
    }

    return line;
  })

  return parsedLines.join('\n');
}

const format = (ogComment: string, header: string, edit: string): string => {
  const formatHeader = "#### " + header + "\n"
  return (
    ogComment + "\n\n" + formatHeader + edit
  )
}

export = (app: Probot) => {
  app.on("pull_request_review_comment.created", async (context: Context) => {
    const comment = context.payload.comment.body.trim();
    const code = parseCode(context.payload.comment.diff_hunk);
    let issueComment = {
      body: '',
      comment_id: context.payload.comment.id,
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
    };

    const language = context.payload.repository.language;
    const githubUsername = context.payload.comment.user.login;
    
    try {
      switch(comment) {
        case '/explain':
          const explainResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/explain`, {
            code,
            inputLanguage: language,
            outputLanguage: 'English',
            githubUsername,
            source: SOURCE_GITHUB
          });
          let explainHeader = "💬 Explanation"
          issueComment.body = format(comment, explainHeader, explainResponse.data.output)
          break;
        case '/complexity':
          const complexityResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/complexity`, {
            code,
            inputLanguage: language,
            githubUsername,
            source: SOURCE_GITHUB
          });
          let timeComplexityHeader = "⏱ Time Complexity"
          issueComment.body = format(comment, timeComplexityHeader, complexityResponse.data.output)
          break;
        default:
          // parse if question is asked
          const index = comment.indexOf("/ask ")
          if (index != -1) {
            const question = comment.substring(index+13)
            const askResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/ask`, {
              code,
              question,
              inputLanguage: language,
              githubUsername,
              source: SOURCE_GITHUB
            });
            let askHeader = "🎤 Answer"
            issueComment.body = format(comment, askHeader, askResponse.data.output)
          }
          break;
      }
    } catch (err: any) {
      if (err?.response.data?.error === 'Invalid GitHub username') {
        issueComment.body = format(comment, `[Sign in](${FRONTEND_ENDPOINT}/github/login?username=${githubUsername}) to use Figstack`, '');
      } else {
        issueComment.body = format(comment, 'Error', 'Unable to generate a response. Please try again later');
      }
    }

    await context.octokit.pulls.updateReviewComment(issueComment);
  });
};
