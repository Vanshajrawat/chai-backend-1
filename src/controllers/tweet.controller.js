import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
	const { content } = req.body

	if (!content) {
		throw new ApiError(400, "Content is required")
	}

	const tweet = await Tweet.create({
		content,
		owner: req.user._id
	})

	const createdTweet = await Tweet.findById(tweet._id).populate(
		"owner",
		"username avatar"
	)

	if (!createdTweet) {
		throw new ApiError(500, "Failed to create tweet")
	}

	return res
		.status(201)
		.json(
			new ApiResponse(
				201,
				createdTweet,
				"Tweet created successfully"
			)
		)
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
	const {userId} = req.params
	const {page = 1, limit = 10} = req.query

	const tweetsAggregate = await Tweet.aggregate([
		{
			$match: {
				owner: new mongoose.Types.ObjectId(userId)
			}
		},
		{
			$lookup: {
				from: "users",
				localField: "owner",
				foreignField: "_id",
				as: "owner"
			}
		},
		{
			$unwind: "$owner"
		},
		{
			$project: {
				content: 1,
				createdAt: 1,
				"owner.username": 1,
				"owner._id": 1,
				"owner.avatar": 1
			}
		},
		{
			$sort: {
				createdAt: -1
			}
		}
	])

	const options = {
		page: parseInt(page, 10),
		limit: parseInt(limit, 10)
	}

	const tweets = await Tweet.aggregatePaginate(
		tweetsAggregate,
		options
	)

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				tweets,
				"Tweets fetched successfully"
			)
		)
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
	const { tweetId } = req.params
	const { content } = req.body

	if (!content) {
		throw new ApiError(400, "Content is required")
	}

	if (!isValidObjectId(tweetId)) {
		throw new ApiError(400, "Invalid tweet id")
	}

	const tweet = await Tweet.findById(tweetId)

	if (!tweet) {
		throw new ApiError(404, "Tweet not found")
	}

	if (tweet.owner.toString() !== req.user._id.toString()) {
		throw new ApiError(403, "You can only update your own tweets")
	}

	const updatedTweet = await Tweet.findByIdAndUpdate(
		tweetId,
		{
			$set: {
				content
			}
		},
		{
			new: true
		}
	).populate("owner", "username avatar")

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				updatedTweet,
				"Tweet updated successfully"
			)
		)
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
	const { tweetId } = req.params

	if (!isValidObjectId(tweetId)) {
		throw new ApiError(400, "Invalid tweet id")
	}

	const tweet = await Tweet.findById(tweetId)

	if (!tweet) {
		throw new ApiError(404, "Tweet not found")
	}

	if (tweet.owner.toString() !== req.user._id.toString()) {
		throw new ApiError(403, "You can only delete your own tweets")
	}

	await Tweet.findByIdAndDelete(tweetId)

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{},
				"Tweet deleted successfully"
			)
		)
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
