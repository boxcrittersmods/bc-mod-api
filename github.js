const Octokit = require('@octokit/rest');


const octokit = new Octokit({
   auth: process.env.FEEDBACK_KEY
 })

function sendFeedback(repo, title, body) {
    var owner = "boxcritters";
    var repo = req.params.repo;
    var title = "Feedback Submission";
    if(req.body.title){
        title = req.body.title + " - " + title;
    }
    var body = req.body.text;
    return octokit.issues.create({
        owner,
        repo,
        title,
        body,
    });
    
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
        }).catch(reject);
        
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