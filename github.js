const Octokit = require('@octokit/rest').plugin(require('@octokit/plugin-retry'));


const octokit = new Octokit({
   auth: process.env.FEEDBACK_KEY
 })

 octokit.request('/').catch(error => {
    if (error.request.request.retryCount) {
      console.log(`request failed after ${error.request.request.retryCount} retries`)
    }
  
    console.error(error)
  })

async function sendFeedback(repo, text, summary) {
    var owner = "boxcritters";
    var repo = "bc-mod-api";
    var title = "Feedback Submission";
    if(summary){
        title = summary + " - " + title;
    }
    var body = text;
    return (await octokit.issues.create({
        owner,
        repo,
        title,
        body
    })).data;
    
}

function loadVersions() {
    return new Promise((resolve,reject)=>{
        var owner = "boxcritters";
        var repo  = "bc-mod-api";
        var path = "versions.json"
        octokit.repos.getContents({
            owner,
            repo,
            path
        }).then((o)=>{            
            var raw = Buffer.from(o.data.content, o.data.encoding).toString()
            var vers = JSON.parse(raw);
            resolve({vers,psha:o.data.sha});
        });
        
    })
}

function saveVersions(versions,sha) {
    var versionText = JSON.stringify(versions,"",2);

    var owner = "boxcritters";
    var repo  = "bc-mod-api";
    var path = "versions.json"
    var message = "Updated Versions";
    var content = Buffer.from(versionText).toString('base64');
    octokit.repos.updateFile({
        owner,
        repo,
        path,
        message,
        content,
        sha
      })
}

module.exports = {sendFeedback,saveVersions,loadVersions};