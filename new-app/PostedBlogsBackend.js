import express from 'express'
import mongoose from 'mongoose'
import bodyParser from "body-parser"
import cors from "cors"
import multer from "multer"
import path from "path"
import admin from 'firebase-admin'
import * as fs from 'fs'
import * as url from 'url'
import Pusher from 'pusher'


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serviceAccountPath = path.resolve(__dirname, './src/pages/new-app-2e4bb-firebase-adminsdk-qj8pn-69fdefd2d2.json');

// Read the JSON file synchronously
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://new-app-2e4bb.firebaseio.com'
});

let app = express();


app.use(bodyParser.json());
app.use(cors({
  origin: 'https://new-create-check.onrender.com', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const pusher = new Pusher({
  appId: "1836415",
  key: "63cbacee7831a9728515",
  secret: "a2c870478a50a44f09de",
  cluster: "us2",
  useTLS: true,
  logToConsole: true
});

mongoose.connect('mongodb+srv://dakshchoksi1507:lFJaFi5Pfcxtj8u1@cluster0.fspokbr.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let chatSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: {type: Date, default: Date.now},
  userId: String,
  senderId: String,
});

let commentSchema = new mongoose.Schema({
  text: String,
  date: { type: Date, default: Date.now }
});

let profilePostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  id: Number,
  secondid: Number,
  date: { type: Date, default: Date.now }
});

let profileSavedBlogsSchema = new mongoose.Schema({
  content: String,
  id: Number,
  title: String,
  author: String,
  secondid: Number,
  email: String,
  password: String
})

let profileSchema = new mongoose.Schema({
  email: String,
  password: String,
  username: {type: String, unique: true},
  bio: String,
  profilepic: String,
  date: { type: Date, default: Date.now },
  Toggler: {type: Boolean, default: false},
  followers: Array,
  following: Array,
  fcmToken: String,
  postedBlogs: [profilePostSchema],
  savedBlogs: [profileSavedBlogsSchema]
});

let postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: { type: Date, default: Date.now },
  id: Number,
  comments: [commentSchema],
  likes: {type: Number, default: 0},
  likedUsers: Array,
  secondid: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'profile', required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'profile', required: false },
  followers: Array,
  email: String,
  password: String,
});

postSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
});

postSchema.set('toJSON', { virtuals: true });

let Post = mongoose.model('post', postSchema);
let Profile = mongoose.model('profile', profileSchema)
let Chat = mongoose.model('chat', chatSchema)

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('profilePic');

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

app.get('/', async (req, res, next) => {
  try {
    let html = fs.readFileSync(path.resolve(root, 'index.html'), 'utf-8')

    // Transform HTML using Vite plugins.
    html = await viteServer.transformIndexHtml(req.url, html)

    res.send(html)
  } catch (e) {
    return next(e)
  }
})

app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  
  const auth = pusher.authorizeChannel(socketId, channel);
  res.send(auth);
});

app.post('/message', async (req, res) => {
  const { username, message, userId, senderId } = req.body;
  const chatMessage = new Chat({ username, message, userId, senderId });
  await chatMessage.save();
  pusher.trigger(`private-user-${userId}`, 'message', {
    username,
    message
  });

  await notifymessage(userId)

  res.sendStatus(200);
});

async function notifymessage(userId) {
  try {
    let profile = await Profile.findById(userId)
    if (profile && profile.fcmToken) {
      try {
        await admin.messaging().send({
          token: profile.fcmToken,
          notification: {
            title: `New message`,
            body: `You got a new message from ${profile.username}`
          }
        });
        console.log(`Notification sent to follower with ID ${userId}`);
      } catch (error) {
        console.error(`Error sending notification to follower with ID ${userId}:`, error);
      }
    }
    console.log('Notifications sent to followers');
  } catch (error) {
    console.error('Error sending notifications to followers:', error);
  }
}

app.get('/message', async (req, res) => {
  try {
    const messages = await Chat.find().sort({ timestamp: 1 }); // Sort messages by timestamp
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.delete('/message', async(req, res) => {
  try {
    const deletedPost = await Chat.deleteMany({})

    if (!deletedPost) {
      return res.status(404).send({ message: 'Post not found' });
    }

    res.status(200).send({ message: 'Post deleted successfully', deletedPost });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting post', error });
  }
})

app.post('/profiles', async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).json({msg: err})
    }
    else {
      if (req.file === undefined) {
        res.status(400).json({message: 'No file selected'})
      }
      else {
        try {
          let {username, bio, email, password} = req.body;
          let profile = new Profile({
            username,
            bio,
            email,
            password,
            profilepic: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
          })
          await profile.save();
          res.status(201).json({
            msg: 'Profile created!',
            profile
          });
        }
        catch (error) {
          res.status(500).json({message: error})
        }
      }
    }
  })
});

app.put('/profiles/:id', async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400).json({ msg: err });
    } else {
      try {
        const { id } = req.params;
        const { username, bio, email, password } = req.body;
        const profilePic = req.file ? `uploads/${req.file.filename}` : undefined;

        const updatedProfile = await Profile.findByIdAndUpdate(
          id,
          { username, bio, email, password,  ...(profilePic && { profilepic: profilePic }) },
          { new: true }
        );

        if (!updatedProfile) {
          return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({
          msg: 'Profile updated!',
          profile: updatedProfile,
        });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  });
});

app.post('/profiles/:id/savedBlogs', async (req,res) => {
  let Id = req.params.id
  let {blogValue, contentId, title, author, uniqueCounter, secondid, email, password} = req.body

  try {
    let profile = await Profile.findById(Id)
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    profile.savedBlogs.push({content: blogValue, id: contentId, title, author, secondid, email, password})
    await profile.save();
    res.status(201).json(profile.savedBlogs)
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.post('/profiles/:id/followers', async (req, res) => {
  let followingId = req.params.id
  let {ID} = req.body
  try {
    let profile = await Profile.findById(ID);
    let followerProfile = await Profile.findById(followingId)
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    followerProfile.followers.push(profile)
    await followerProfile.save();
    res.status(201).json(followerProfile);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
})

app.post('/profiles/:id/secondFollowers', async (req, res) => {
  let followingId = req.params.id
  let {ID} = req.body
  try {
    let profile = await Profile.findById(ID);
    let followerProfile = await Profile.findById(followingId)
    if (!followerProfile) {
      return res.status(404).json({ message: 'Profile not found' })
    }
    profile.following.push(followerProfile)
    await profile.save();
    res.status(201).json(profile);
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
})

app.put('/profiles/:id/fcm-token', async (req, res) => {
  try {
    const { id } = req.params;
    const { fcmToken } = req.body;

    const updatedProfile = await Profile.findByIdAndUpdate(
      id,
      { fcmToken },
      { new: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({
      message: 'FCM token updated!',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating FCM token:', error);
    res.status(500).json({ message: error.message });
  }
});


app.get('/profiles', async (req, res) => {
  try {
    const profiles = await Profile.find();

    res.status(200).json(profiles);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.post('/posts', async (req, res) => {
  let { title, content, author, id, secondid, authorId, email, password } = req.body
  let profileId = await Profile.findById(authorId)
  let post = new Post({title, content, author, id, secondid, email, password, user: profileId._id});
  profileId.postedBlogs.push({ title: title, content: content, author: author, id: id, secondid: secondid })
  await profileId.save();
  await post.save();
  await notifyFollowers(post)
  res.status(201).send(post);  
});

async function notifyFollowers(post) {
  try {
    let profile = await Profile.findById(post.user._id)
    const followers = profile.followers; // Assuming followers is an array of follower profile IDs

    // Prepare notification message
    const promises = followers.map(async (followerId) => {
      const profile = await Profile.findById(followerId._id);
      if (profile && profile.fcmToken) {
        try {
          await admin.messaging().send({
            token: profile.fcmToken,
            notification: {
              title: 'New Blog Post',
              body: `Check out the latest blog post on BlogaRouter! by ${profile.username}`
            }
          });
          console.log(`Notification sent to follower with ID ${followerId._id}`);
        } catch (error) {
          console.error(`Error sending notification to follower with ID ${followerId._id}:`, error);
        }
      }
    });

    await Promise.all(promises);
    console.log('Notifications sent to followers');
  } catch (error) {
    console.error('Error sending notifications to followers:', error);
  }
}

app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find()
    .populate('user', ['username', 'bio', 'profilepic'])
    res.json(posts);
} catch (err) {
    res.status(500).json({ message: err.message });
}
})

app.post('/posts/:id/followers', async (req, res) => {
  let followerId = req.params.id
  let {ID, ID2} = req.body
  try {
    let profileId = await Profile.findById(followerId)
    let profileId2 = await Profile.findById(ID2)
    let post = await Post.findById(ID)
    let userId = post.user._id
    let profileId3 = await Profile.findById(userId)
    if (profileId) {
      post.following = profileId._id
      post.followers.push(profileId2)
      profileId3.followers.push(profileId2)
      profileId2.following.push(profileId)
      await post.save();
      await profileId3.save();
      await profileId2.save();
      res.status(201).json(post);
    }
    else {
      res.status(404).json({ message: 'Post not found' })
    }
  }
  catch (error) {
    console.error('Error adding follower:', error)
    res.status(500).json({ message: error.message });
  }
})

app.post('/posts/:id/keepFollowers', async (req, res) => {
  let keepFollowerId = req.params.id

  try {
    let post = await Post.findById(keepFollowerId)
    let profileId = post.user._id
    let profile = await Profile.findById(profileId)
    if (profile) {
      profile.Toggler = true
      await profile.save();
      res.status(201).json(profile)
    }
    else {
      res.status(404).json({message: 'profile not found'})
    }
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
})

app.post('/posts/:id/keepFollowers1', async (req, res) => {
  let followerId = req.params.id

  try {
    let profile = await Profile.findById(followerId)
    if (profile) {
      profile.Toggler = false
      await profile.save();
      res.status(201).json(profile)
    }
    else {
      res.status(404).json({message: 'profile not found'})
    }
  }
  catch (error) {
    console.error(error)
    res.status(500).json({ message: error.message });
  }
})

app.post('/posts/:id/comments', async (req, res) => {
  const postId = req.params.id;
  const { comment } = req.body;

  try {
    const post = await Post.findById(postId);
    if (post) {
      post.comments.push({ text: comment });
      await post.save();
      res.status(201).json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ message: error.message });
  }
});

app.post('/posts/:id/like', async (req, res) => {
  try {
    let like = req.params.id
    let {ID} = req.body
    let show = await Post.findById(like)
    show.likes += 1
    show.toggler = true
    show.likedUsers.push(ID)
    await show.save();
    res.status(200).json({likes: show.likes, userlikes: show.likedUsers})
  }
  catch (error) {
    res.status(500).json({error: 'Internal server error'})
  }
});

app.post('/posts/:id/dislike', async (req, res) => {
  try {
    let {ID} = req.body
    let like = req.params.id
    let show = await Post.findById(like)
    show.likes -= 1
    show.toggler = false
    let foundIndex = show.likedUsers.findIndex(userId => userId === ID);
    if (foundIndex !== -1) {
      // Remove the user from the likedUsers array
      show.likedUsers.splice(foundIndex, 1);
    }

    await show.save();
    res.status(200).json({likes: show.likes, userlikes: show.likedUsers})
  }
  catch (error) {
    res.status(500).json({error: 'Internal server error'})
  }
});


app.delete('/profiles', async (req, res) => {

  let { id } = req.body

  try {
    let deletedprofile = await Profile.findByIdAndDelete(id);

    if (!deletedprofile) {
      return res.status(400).send({ message: 'Profile not found '})
    }

    res.status(200).json({message : 'profile deleted', deletedprofile})
  }
  catch (error) {
    res.status(500).json({error: 'Internal server error', error})
  }
})


app.delete('/posts', async (req, res) => {
  const { id, Id } = req.body;

  try {
    let post = await Post.findById(id)
    let profile = await Profile.findById(Id)
    profile.postedBlogs = profile.postedBlogs.filter(blog => Number(post.id) !== Number(blog.id) && post.content !== blog.content && post.author !== blog.author && post.title !== blog.title && post.secondid !== blog.secondid);
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return res.status(404).send({ message: 'Post not found' });
    }
    await profile.save();
    res.status(200).send({ message: 'Post deleted successfully', deletedPost });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting post', error });
  }
});

app.delete('/profiles/:id/savedBlogs', async (req, res) => {
  let Id = req.params.id
  let {deleteId} = req.body

  try {
    let profile = await Profile.findById(Id)
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' })
    }

    profile.savedBlogs = profile.savedBlogs.filter(blogs => blogs.id.toString() !== deleteId.toString())

    await profile.save();
    res.status(200).json('removed')
  } catch(error) {
    console.error('Error removing follower:', error);
    res.status(500).json({ message: error.message });
  }
})

app.delete('/posts/:id/followers', async (req, res) => {
  const postId = req.params.id;
  const { Id, followingId } = req.body; // ID of the follower to be removed

  try {
    const post = await Post.findById(postId);
    let profileId = post.user._id
    let profile = await Profile.findById(profileId)
    let profile2 = await Profile.findById(Id)
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove the follower from the followers array
    post.followers = post.followers.filter(follower => follower._id.toString() !== Id.toString());
    profile.followers = profile.followers.filter(follower => follower._id.toString() !== Id.toString());
    profile2.following = profile2.following.filter(following => following._id.toString() !== profileId.toString());

    await post.save();
    await profile.save();
    await profile2.save();
    res.status(200).json({ message: 'Follower removed successfully', post });
  } catch (error) {
    console.error('Error removing follower:', error);
    res.status(500).json({ message: error.message });
  }
});

app.delete('/posts/:id/followersAfterNoPost', async(req, res) => {
  let FollowerId = req.params.id;
  let {Id} = req.body;
  
  try {
    let profile = await Profile.findById(FollowerId)
    let profile2 = await Profile.findById(Id)
    if (!profile) {
      return res.status(404).json({message: 'Profile not found'})
    }
    profile.followers = profile.followers.filter(follower => follower._id.toString() !== Id.toString());
    profile2.following = profile2.following.filter(following => following._id.toString() !== FollowerId.toString());
    profile.Toggler = true

    await profile2.save();
    await profile.save();
    res.status(200).json({ message: 'Follower removed successfully', profile });
  }
  catch (error) {
    console.error('Error removing follower:', error);
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.The_port_to_use || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

