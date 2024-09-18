// Este es un servicio API simulado
const API = {
    getJiraData: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            openIssues: 10,
            inProgress: 5,
            completed: 15,
          });
        }, 500);
      });
    },
    
    getSlackData: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            newMessages: 25,
            activeChannels: 5,
            onlineMembers: 8,
          });
        }, 500);
      });
    },
    
    getBitbucketData: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            totalCommits: 15,
            openPullRequests: 3,
            latestCommit: "Update README.md",
          });
        }, 500);
      });
    },
  };
  
  export default API;