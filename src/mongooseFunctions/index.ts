import User from "../models/users";
import Conversation from "../models/conversations";
import Message from "../models/messages";
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
export const mongoFindUser = async(id) => {
    return User.findOne({_id: id}).exec();
}


/*
const conversationSchema = new mongoose.Schema(
  {
    conversation_id: {
        type: String,
        required: true,
        unique: true
    },
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
    createdAt: {type: Date, default: new Date().getTime()},
  },
);
*/


export const addFriend = async(userId, friendId) => {
  const user = await mongoFindUser(userId);
  const friend = await mongoFindUser(friendId)
  const getFriendId = await getFriend(userId, friendId);

  

  
  if(user && friend && !getFriendId) {
    const conv =  await Conversation.create({
      _id: new mongoose.Types.ObjectId(),
      conversation_id: new mongoose.Types.ObjectId(),
      user: user!._id,
      friend: friend!._id,
      messages: [],
    });

      user!.friends = [...user!.friends, friendId];
      user!.conversation.push(conv._id);
      await conv.save();
      await user!.save();
  } else {
    console.log('Friend already been added to friendlist.')
  }
}



export const getFriend = async(userId, friendId) => {
    let friend;
    const user = await mongoFindUser(userId);
    await Promise.all(
        friend = user!.friends.filter(e => String(e._id) === friendId)
    );
    return String(friend);
}




export const getFriends = async(id) => {
    let friendList:any = [];
    const user = await mongoFindUser(id);
    await Promise.all(
      user!.friends.map((friend) => {
        friendList.push(String(friend))
      })
    );
    return friendList;
}

export const populateFriends = async(id) => {
  const friends = await User.findOne({_id: id})
  .populate({
    path:"friends",
    model: "User"
  })
  .exec();
  console.log(friends?.friends);
  return friends?.friends;
}

export const populateUser = async(id) => {
  const u = await Conversation.findOne({id: id})
  .populate({
    path:"user",
    model: "User"
  })
  .exec();
  return u;
}

export const getMyId = async(id) => {
  const user = await mongoFindUser(id);

  return await user?._id;
}

export const sGetMyId = async(id) => {
  const user = await User.findOne({_id: id}).exec();
  let response:any = {};
  response.identityKeyPair = user!['identityKeyPair'];
  response.baseKeyId = user!['baseKeyId'];
  response.preKey = user!['preKey'];
  response.signedPreKeyId = user!['signedPreKeyId'];
  response.signedPreKey = user!['signedPreKey'];
  return await response;
} 

export const sGetFriendId = async(id) => {
  const user = await User.findOne({_id: id}).exec();
  let response:any = {};
  response.identityKeyPair = user!['identityKeyPair'];
  response.baseKeyId = user!['baseKeyId'];
  response.preKey = user!['preKey'];
  response.signedPreKeyId = user!['signedPreKeyId'];
  response.signedPreKey = user!['signedPreKey'];
  return await response;
} 

export const removeFriend = async(userId, friendId) => {
    let user = await mongoFindUser(userId);
    await Promise.all(
        user!.friends = user!.friends.filter(e => String(e._id) !== friendId)
    );
    await user!.save();
}

export const getMessages = async(userId, friendId) => {
  const user = await mongoFindUser(userId);
  const friend = await mongoFindUser(friendId)
  const getFriendId = await getFriend(userId, friendId);

  if(user && friend && getFriendId) {
    return await Conversation.findOne({user: userId, friend: friendId})
    .populate({
      strictPopulate: false,
      path:"messages",
      model: 'Message'
    }).exec()
  }
}

export const getConversations = async(userId) => {
  const user = await mongoFindUser(userId);

  if(user) {
    return await Conversation.find({user: userId})
    .populate({
      strictPopulate: false,
      path:"user",
      model: 'User',
      select:'avatar name online username',
    })
    .populate({
      strictPopulate: false,
      path:"friend",
      model: 'User',
      select:'avatar name online username',
    })
    .populate({
      strictPopulate: false,
      path:"messages",
      model: 'Message',
      select:'messages to from message conversation timestamp',
      populate: {
        path: 'from',
        model: 'User',
        select:'_id email avatar name online username'
      },
    }).populate({
      strictPopulate: false,
      path:"messages",
      model: 'Message',
      select:'messages to from message conversation timestamp',
      populate: {
        path: 'to',
        model: 'User',
        select:'_id email avatar name online username'
      },
    }).exec();
  }
}











export const getConversation = async(userId, convId) => {
  const user = await mongoFindUser(userId);

  if(user) {
    return await Conversation.find({user: userId, conversation_id: convId})
    .populate({
      strictPopulate: false,
      path:"user",
      model: 'User',
      select:'avatar name online username',
    })
    .populate({
      strictPopulate: false,
      path:"friend",
      model: 'User',
      select:'avatar name online username',
    })
    .populate({
      strictPopulate: false,
      path:"messages",
      model: 'Message',
      select:'messages to from message conversation timestamp',
      populate: {
        path: 'from',
        model: 'User',
        select:'_id email avatar name online username'
      },
    }).populate({
      strictPopulate: false,
      path:"messages",
      model: 'Message',
      select:'messages to from message conversation timestamp',
      populate: {
        path: 'to',
        model: 'User',
        select:'_id email avatar name online username'
      },
    }).exec();
  }
}







export const getConversationByFriendId = async(userId, friendId) => {
  const user = await mongoFindUser(userId);

  if(user) {
    return await Conversation.find({user: userId, friend: friendId})
    .populate({
      strictPopulate: false,
      path:"user",
      model: 'User',
      select:'avatar name online username',
    })
    .populate({
      strictPopulate: false,
      path:"friend",
      model: 'User',
      select:'avatar name online username',
    })
    .populate({
      strictPopulate: false,
      path:"messages",
      model: 'Message',
      select:'messages to from message conversation timestamp',
      populate: {
        path: 'from',
        model: 'User',
        select:'_id email avatar name online username'
      },
    }).populate({
      strictPopulate: false,
      path:"messages",
      model: 'Message',
      select:'messages to from message conversation timestamp',
      populate: {
        path: 'to',
        model: 'User',
        select:'_id email avatar name online username'
      },
    }).exec();
  }
}





export const getContactList = async(userId) => {
  const user = await mongoFindUser(userId);

  if(user) {
    return await Conversation.find({user: userId})
    .populate({
      strictPopulate: false,
      path:"friend",
      model: 'User',
      select:'avatar name online username',
    }).select("friend conversation_id -_id").exec();
  }
}









// export const addMessageForFriend = async (friendId, userId, message="asd") => {
//   const user = await mongoFindUser(userId);
//   const friend = await mongoFindUser(friendId);

//   const myConv = await User.findOne({_id: userId})
//   .populate({
//     strictPopulate: false,
//     path:"conversation",
//     model: "Conversation"
//   })
//   .exec();

//   const friendConv = await User.findOne({_id: friendId})
//   .populate({
//     strictPopulate: false,
//     path:"conversation",
//     model: "Conversation"
//   })
//   .exec();

//   myConv?.conversation.forEach(e => {
//     if(e["user"].toString() === userId && e["friend"].toString() === friendId) {
//       const msg = Message.create({
//         _id: new mongoose.Types.ObjectId(),
//         message: message,
//         from: user?._id,
//         to: friend?._id,
//         conversation: e["conversation_id"]
//       });
      
//       e["messages"].push(msg);
//     }
//   });

//   friendConv?.conversation.forEach(e => {
//     if(e["friend"].toString() === friendId && e["user"].toString() === userId) {
//       const msg = Message.create({
//         _id: new mongoose.Types.ObjectId(),
//         message: message,
//         from: user?._id,
//         to: friend?._id,
//         conversation: e["conversation_id"]
//       });
      
//       e["messages"].push(msg);
//     }
//   });


// }




export const addMessage = async(userId, friendId, message) => {
 

  
  await Conversation.findOne({user: userId, friend: friendId})
  .populate({
    strictPopulate: false,
    path:"messages",
    model: 'Message'
  }).exec().then(async(r:any) => {
    const msg = await Message.create({
      message: message,
      from: new mongoose.Types.ObjectId(userId),
      to: new mongoose.Types.ObjectId(friendId),
      conversation: new mongoose.Types.ObjectId()
    }).then(async(m) => {
      (await m).save();
      //r.messages = [...r.messages, m];
      console.log('first');
      r.messages.push(m);
      (await r).save();
    });

    
  });


  await Conversation.findOne({user: friendId, friend: userId})
  .populate({
    strictPopulate: false,
    path:"messages",
    model: 'Message'
  }).exec().then(async(r:any) => {
    const msg = await Message.create({
      message: message,
      from: new mongoose.Types.ObjectId(userId),
      to: new mongoose.Types.ObjectId(friendId),
      conversation: new mongoose.Types.ObjectId()
    }).then(async(m) => {
      (await m).save();
      r.messages.push(m);
      console.log('second');
      (await r).save();
    });

    
  });


}




//////////////////////////////////////////////////////////////



export const sAddMessage = async(userId, friendId, message) => {
 

  
  await Conversation.findOne({user: userId, friend: friendId})
  .populate({
    strictPopulate: false,
    path:"messages",
    model: 'Message'
  }).exec().then(async(r:any) => {
    const msg = await Message.create({
      message: message,
      from: new mongoose.Types.ObjectId(userId),
      to: new mongoose.Types.ObjectId(friendId),
      conversation: new mongoose.Types.ObjectId()
    }).then(async(m) => {
      (await m).save();
      //r.messages = [...r.messages, m];
      console.log('first');
      r.messages.push(m);
      (await r).save();
    });

    
  });


  await Conversation.findOne({user: friendId, friend: userId})
  .populate({
    strictPopulate: false,
    path:"messages",
    model: 'Message'
  }).exec().then(async(r:any) => {
    const msg = await Message.create({
      message: message,
      from: new mongoose.Types.ObjectId(userId),
      to: new mongoose.Types.ObjectId(friendId),
      conversation: new mongoose.Types.ObjectId()
    }).then(async(m) => {
      (await m).save();
      r.messages.push(m);
      console.log('second');
      (await r).save();
    });

    
  });


}




 