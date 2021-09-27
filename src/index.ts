import { Probot, Context } from "probot";
import axios from 'axios';
import { BACKEND_ENDPOINT } from './constants';
const ACCESS_TOKEN = "PxyqEHcpLogOyEIUaByzdy6vyISIzhdf";
const SOURCE_GITHUB = 'github'

const format = (ogComment: String, header: String, edit: String) => {
  const formatHeader = "#### " + header + "\n"
  return (
    ogComment + "\n\n" + formatHeader + edit
  )
}

export = (app: Probot) => {
  app.on("pull_request_review_comment.created", async (context: Context) => {
    console.log(context.payload.sender);
    const comment = context.payload.comment.body;
    const code = context.payload.comment.diff_hunk;
    let issueComment = context.issue({
      body: "pr commentt",
    });
    
    try {
      switch(comment) {
        case '/explain':
          const explainResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/explain`, {
            code,
            outputLanguage: 'English',
            accessToken: ACCESS_TOKEN,
            source: SOURCE_GITHUB
          });
          let explainHeader = "Explanation"
          issueComment.body = format(comment, explainHeader, explainResponse.data.output)
          break;
        case '/complexity':
          const complexityResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/complexity`, {
            code,
            accessToken: ACCESS_TOKEN,
            source: SOURCE_GITHUB
          });
          let timeComplexityHeader = "Time Complexity"
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
              accessToken: ACCESS_TOKEN,
              source: SOURCE_GITHUB
            });
            let askHeader = "Answer"
            issueComment.body = format(comment, askHeader, askResponse.data.output)
          }
          break;
      }
    } catch (err: any) {
      console.log(err)
    }

    await context.octokit.pulls.updateReviewComment(issueComment);
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
