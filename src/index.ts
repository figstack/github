import { Probot, Context } from "probot";
import axios from 'axios';
import { BACKEND_ENDPOINT, FRONTEND_ENDPOINT } from './constants';
const SOURCE_GITHUB = 'github';

type Comment = {
  diff_hunk: string;
  original_start_line: number;
  original_line: number;
}

const parseCode = (comment: Comment) => {
  const diff = comment.diff_hunk;
  const trimmedCode = diff.trim();
  const lines = trimmedCode.split('\n');
  const relevantLastLinesCount = comment.original_line - (comment.original_start_line || comment.original_line) + 1;
  const lastLines = lines.slice(relevantLastLinesCount);

  const parsedLines = lastLines.map((line) => {
    const firstCharacter = line.charAt(0);
    if (firstCharacter === '-' || firstCharacter === '+') {
      return line.substring(1).trim();
    }

    return line;
  });

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
    const code = parseCode(context.payload.comment);
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
          issueComment.body = format(comment, timeComplexityHeader, "O(" + complexityResponse.data.output + ")")
          break;
        default:
          // parse if question is asked
          const index = comment.indexOf("/ask ")
          if (index != -1) {
            const question = comment.substring(index+5)
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
      console.log(err?.response.data);
      if (err?.response.data?.error === 'Invalid GitHub username') {
        issueComment.body = format(comment, `[Sign in](${FRONTEND_ENDPOINT}/github/login?username=${githubUsername}) to use Figstack`, '');
      } else {
        issueComment.body = format(comment, 'Error', 'Unable to generate a response. Please try again later');
      }
    }

    await context.octokit.pulls.updateReviewComment(issueComment);
  });
};
