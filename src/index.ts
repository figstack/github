import { Probot } from "probot";

export = (app: Probot) => {
  app.on("pull_request_review_comment.created", async (context) => {
    const issueComment = context.issue({
      body: "pr commentt",
    });
    await context.octokit.issues.createComment(issueComment);
    console.log(context);
    console.log(context);
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
