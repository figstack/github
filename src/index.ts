import { Probot } from "probot";

export = (app: Probot) => {
  // app.on("issue_comment.created", async (context) => {
  //   const issueComment = context.issue({
  //     body: "issue comment!",
  //   });
  //   console.log(context);
  //   await context.octokit.issues.createComment(issueComment);
  // });

  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });

  app.on('pull_request.opened', async context =>{
    const pr =context.payload.pull_request
    const user = pr.user.login //Collecting Details of the person who created the PR
    const msg=context.issue({body:'Hey ' + user + ' 👋, Thanks for the PR !!! You are Awesome.'})
    return context.octokit.issues.createComment(msg)
  })

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
