/*jshint esversion: 6 */
(() => {
  'use strict';
  const socketData = {};
  
  
  module.exports = (http) => {
    const io = require('socket.io')(http);
    
    io.on('connection', (socket) => {
      socketData[socket.id] = {
        openReplies: []
      };
      
      const socketIds = Object.keys(socketData);
      for (let i = 0; i < socketIds.length; i++) {
        let socketId  = socketIds[i];
        for (let j = 0; j < socketData[socketId].openReplies.length; j++) {
          socket.emit('reply:locked', socketData[socketId].openReplies[j]);
        }
      }
      
      socket.on('reply:opened', (data) => {
        let replyIndex = socketData[socket.id].openReplies.indexOf(data.replyId);
        if (replyIndex < 0) {
          socketData[socket.id].openReplies.push(data.replyId);
        }
        
        io.emit('reply:locked', data.replyId);
      });
      
      socket.on('reply:closed', (data) => {
        let replyIndex = socketData[socket.id].openReplies.indexOf(data.replyId);
        if (replyIndex > -1) {
          socketData[socket.id].openReplies.splice(replyIndex, 1);
        }
        
        io.emit('reply:unlocked', data.replyId);
      });
      
      socket.on('disconnect', () => {
        for (let i = 0; i < socketData[socket.id].openReplies.length; i++) {
          io.emit('reply:unlocked', socketData[socket.id].openReplies[i]);
        }
        
        delete socketData[socket.id];        
      });
    });
  };
  
  
})();