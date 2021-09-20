import { Probot } from "probot";
import axios from 'axios';
import { BACKEND_ENDPOINT } from './constants';
const ACCESS_TOKEN = "23xAgUh0aQBzjbxS7Gm-SeD6qSbkQ8M0";
export = (app: Probot) => {
  app.on("pull_request_review_comment.created", async (context) => {
    const comment = context.payload.comment.body;
    const code = context.payload.comment.diff_hunk
    const source = 'github'
    let issueComment = context.issue({
      body: "pr commentt",
    });
    
    try {
      switch(comment) {
        case 'figstack explain':
          const explainResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/explain`, {
            code,
            outputLanguage: 'English',
            accessToken: ACCESS_TOKEN,
            source
          });
          issueComment = context.issue({
            body: explainResponse.data.output
          })
          break;
        case 'figstack time complexity':
          const complexityResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/complexity`, {
            code,
            accessToken: ACCESS_TOKEN,
            source
          });
          issueComment = context.issue({
            body: complexityResponse.data.output
          })
          break;
        default:
          // parse if question is asked
          const index = comment.indexOf("figstack ask ")
          if (index != -1) {
            const question = comment.substring(index+13)
            const askResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/ask`, {
              code,
              question,
              accessToken: ACCESS_TOKEN,
              source
            });
            issueComment = context.issue({
              body: askResponse.data.output
            })
          }
          break;
      }
    } catch (err: any) {
      console.log(err)
    }

    await context.octokit.issues.createComment(issueComment);
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
