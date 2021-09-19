import { Probot } from "probot";
// import axios from 'axios';
// import { BACKEND_ENDPOINT } from './constants';

export = (app: Probot) => {
  app.on("pull_request_review_comment.created", async (context) => {
    // const originalComment = context.payload.comment.body;
    // const { owner } = context.payload.repository
    const newComment = {
      pull_number: context.payload.pull_request.id,
      repo: context.payload.repository.name,
      comment_id: context.payload.comment.id,
      owner: context.payload.repository.owner.login,
      body: 'THREADDD'
    }
    
    // try {
    //   const { refreshToken, accessToken } = getTokens();
    //   switch(originalComment) {
    //     case 'figstack explain':
    //       break;
    //     case 'figstack time complexity':
    //       break;
    //     default:
    //       // parse if question is asked
    //       const index = originalComment.indexOf("figstack ask ")
    //       if (index != -1) {
    //         const question = originalComment.substring(index+13)
    //         const askResponse = await axios.post(`${BACKEND_ENDPOINT}/function/v1/ask`, {
    //           code: context.payload.comment.diff_hunk,
    //           question,
    //           accessToken,
    //           refreshToken,
    //           source: 'github'
    //         });
    //         const { output } = askResponse.data;
    //         newComment.body = output
    //       }
    //       break;
    //   }
    // } catch (err: any) {
    //   //
    // }
    try {
      await context.octokit.pulls.createReplyForReviewComment(newComment);
    } catch (err: any) {
      console.log(err)
    }

  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
