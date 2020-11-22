const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const PostSchema = new Schema({
    details: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
    },
    image: {
       type: String, 
    },
    date: {
        type: Date,
        default: Date.now
    }, 
    status: {
        type: String,
        default: 'public'
    },
    allowComments: {
        type: Boolean,
        default: true
    },
    comments:[{
        commentBody: {
            type: String,
            required: true
        },
        commentDate: {
            type: Date,
            default: Date.now(),
        },
        commentUser: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
    }]
}); 

mongoose.model('posts', PostSchema);

