import { Probot, Context } from "probot";
import axios from 'axios';
import { BACKEND_ENDPOINT, EXPLAIN_COMMAND, COMPLEXITY_COMMAND, ASK_COMMAND } from './constants';

const ACCESS_TOKEN = "23xAgUh0aQBzjbxS7Gm-SeD6qSbkQ8M0";
const SOURCE_GITHUB = 'github'

export = (app: Probot) => {
  app.on("pull_request_review_comment.created", async (context: Context) => {
    const comment = context.payload.comment.body;
    const code = context.payload.comment.diff_hunk;
    let issueComment = context.issue({
      body: "pr commentt",
    });
    
    try {
      switch(comment) {
        case EXPLAIN_COMMAND:
          const explainResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/explain`, {
            code,
            outputLanguage: 'English',
            accessToken: ACCESS_TOKEN,
            source: SOURCE_GITHUB
          });
          issueComment = context.issue({
            body: explainResponse.data.output
          })
          break;
        case COMPLEXITY_COMMAND:
          const complexityResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/complexity`, {
            code,
            accessToken: ACCESS_TOKEN,
            source: SOURCE_GITHUB
          });
          issueComment = context.issue({
            body: complexityResponse.data.output
          })
          break;
        default:
          // parse if question is asked
          const index = comment.indexOf(ASK_COMMAND)
          if (index != -1) {
            const question = comment.substring(ASK_COMMAND.length + 1);
            const askResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/ask`, {
              code,
              question,
              accessToken: ACCESS_TOKEN,
              source: SOURCE_GITHUB
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
