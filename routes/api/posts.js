const express = require('express');
const router = express.Router();
const {check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

//modesl
const User = require('../../models/User');
const Post = require('../../models/Post');
//const Profile = require('../../models/profile');


// @route     POST api/posts
// @desc      Create a new post
// @access    Private

router.post('/', [auth, 
    [
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

        const post = await newPost.save()

        res.json(post)

    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error!')
    }

    
    
})


// @route     GET api/posts
// @desc      Get all the posts
// @access    Private
router.get('/', auth, async(req, res) => {
    try{
        const posts = await Post.find().sort({date: -1});
        res.json(posts);

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error!')
    }
})

// @route     GET api/posts/:post_id
// @desc      Get by post by post_id
// @access    Private
router.get('/:post_id', auth, async(req, res) => {
    try{
        const post = await Post.findOne({_id: req.params.post_id});
        if(!post) {
            return res.status(404).json({msg: 'Post not found'})
        }

        //check if its not a valid post id
        if(err.kind === 'ObjectId') {
            return res.status(404).json({msg: 'Post not found'})
        }

        res.json(post);

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// @route     DELETE api/posts/:post_id
// @desc      Delete post by id
// @access    Private
router.delete('/:post_id', auth, async(req, res) => {
    try{
         const post = await Post.findById(req.params.post_id);

         // check on the user matchs the post_id
         if(post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User is not authorized to delete post'})
         }

        

        if(!post) {
            return res.status(404).json({msg: 'Post not found'})
        }

         await post.remove()

         res.json({msg: 'post was removed'})

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
})


// @route     PUT api/posts/like/:id
// @desc      Like a post
// @access    Private
router.put('/like/:id', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        //check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() == req.user.id).length > 0) {
            return res.status(400).json({msg: "user already liked this post"})
        }

        post.likes.unshift({user: req.user.id})
      await post.save();

      res.json(post.likes)

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error!')
    }
})

// @route     PUT api/posts/unlike/:id
// @desc      Like a post
// @access    Private
router.put('/unlike/:id', auth, async(req, res) => {
    try{
        const post = await Post.findById(req.params.id);

        //check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() == req.user.id).length === 0) {
            return res.status(400).json({msg: "Post has not yet been liked"})
        }

        //get the remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

      await post.save();

      res.json(post.likes)
      
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error!')
    }
})


// @route     POST api/posts/comment/:id
// @desc      Comment on a post
// @access    Private

router.post('/comment/:id', [auth, 
    [
        check('text', 'Text is required')
            .not()
            .isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        }
        post.comments.unshift(newComment)
        post.save()

        res.json(post.comments)

    } catch(err) {
        console.error(err.message)
        res.status(500).send('Server Error!')
    }

    
    
})



// @route     Delete api/posts/comment/:id/:comment_id
// @desc      Delete a comment
// @access    Private
router.delete('/comment/:id/:comment_id', auth, async(req, res) => {

    try{
        const post = await Post.findById(req.params.id);

        //pull out the comment
        const comment = await post.comments.find(comment => comment.id === req.params.comment_id);

        //Make sure that the comment exists
        if(!comment) {
            return res.status(404).json({msg: "Comment does not exist"})
        }

        // check if user created the comment
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: "Error, current user did not create this comment"})

        }

         //get the remove index
         const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

         post.comments.splice(removeIndex, 1);
 
        await post.save();
 
        res.json(post.comments)


    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server error')
    }
})


module.exports = router;