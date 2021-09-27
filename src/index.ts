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
    const comment = context.payload.comment.body;
    const code = context.payload.comment.diff_hunk;
    let issueComment = {
      body: format(comment, "Explanation", "EDIT"),
      comment_id: context.payload.comment.id,
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
    };
    
    try {
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
