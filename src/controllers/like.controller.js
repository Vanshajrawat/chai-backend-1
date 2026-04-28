import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: req.user._id
    })

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLiked: false },
                    "Like removed successfully"
                )
            )
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "Like added successfully"
            )
        )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id
    })

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLiked: false },
                    "Like removed successfully"
                )
            )
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "Like added successfully"
            )
        )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLiked: false },
                    "Like removed successfully"
                )
            )
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user._id
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "Like added successfully"
            )
        )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideosAggregate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: {
                    $exists: true,
                    $ne: null
                }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $lookup: {
                from: "users",
                localField: "video.owner",
                foreignField: "_id",
                as: "video.owner"
            }
        },
        {
            $unwind: "$video.owner"
        },
        {
            $project: {
                _id: 0,
                "video._id": 1,
                "video.title": 1,
                "video.description": 1,
                "video.videoFile": 1,
                "video.thumbnail": 1,
                "video.views": 1,
                "video.duration": 1,
                "video.createdAt": 1,
                "video.owner.username": 1,
                "video.owner.avatar": 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    const likedVideos = await Like.aggregatePaginate(
        likedVideosAggregate,
        {
            page: 1,
            limit: 10
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}