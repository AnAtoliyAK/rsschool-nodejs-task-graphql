import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import { FastifyInstance, RawServerDefault, FastifyBaseLogger } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { FromSchemaDefaultOptions } from 'json-schema-to-ts';
import { ChangePostDTO, CreatePostDTO } from '../../../utils/DB/entities/DBPosts';
import { ChangeProfileDTO, CreateProfileDTO } from '../../../utils/DB/entities/DBProfiles';
import { ChangeUserDTO, CreateUserDTO } from '../../../utils/DB/entities/DBUsers';
import uuid = require('uuid');
import { CreateMemberTypeDTO } from '../../../utils/DB/entities/DBMemberTypes';

type TFastify = FastifyInstance<RawServerDefault, IncomingMessage, ServerResponse<IncomingMessage>, FastifyBaseLogger, JsonSchemaToTsProvider<FromSchemaDefaultOptions>>

export class ResolveGraphQlService {
    static async getUsers(fastify: TFastify) {
        return await fastify.db.users.findMany();
    }

    static async getProfiles(fastify: TFastify) {
        return fastify.db.profiles.findMany();
    }

    static async getPosts(fastify: TFastify) {
        return fastify.db.posts.findMany();
    }

    static async getMemberTypes(fastify: TFastify) {
        return await fastify.db.memberTypes.findMany();
    }

    static async getUserById(fastify: TFastify, userId: string) {
        return fastify.db.users.findOne({ key: 'id', equals: userId });
    }

    static async getProfileById(fastify: TFastify, profileId: string) {
        return fastify.db.profiles.findOne({ key: 'id', equals: profileId });
    }

    static async getPostById(fastify: TFastify, postId: string) {
        return fastify.db.posts.findOne({ key: 'id', equals: postId });
    }

    static async getMemberTypeById(fastify: TFastify, memberTypeId: string) {
        return fastify.db.memberTypes.findOne({ key: 'id', equals: memberTypeId });
    }

    static async getFullUsers(fastify: TFastify) {
        const users = await fastify.db.users.findMany();

        const fullUsers = users?.map(async (user) => {
            const posts = await fastify.db.posts.findMany({ key: 'userId', equals: user.id });
            const profiles = await fastify.db.profiles.findMany({ key: 'userId', equals: user.id });

            const memberTypes = profiles?.map(async (profile) => {

                return fastify.db.memberTypes.findMany({ key: 'id', equals: profile.memberTypeId });
            })

            return { ...user, posts, profiles, memberTypes }
        })
        return fullUsers;
    }

    static async getFullUserById(fastify: TFastify, userId: string) {
        const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
        const posts = await fastify.db.posts.findMany({ key: 'userId', equals: userId });
        const profiles = await fastify.db.profiles.findMany({ key: 'userId', equals: userId });
        const memberTypes = profiles?.map(async (profile) => {
            return await fastify.db.memberTypes.findMany({ key: 'id', equals: profile.memberTypeId });
        })

        return { ...user, posts, profiles, memberTypes };
    }

    static async getUsersWithSubscribeTo(fastify: TFastify) {
        const users = await fastify.db.users.findMany();
        const userWithSubscription = users?.map((user) => {
            const filteredUsers = users?.filter(
                (_user) => _user?.subscribedToUserIds?.includes(user?.id)
            )

            const userSubscribedToProfiles = filteredUsers?.map(async (subscribedToUserId) => {
                return await fastify.db.profiles.findMany({ key: 'userId', equals: subscribedToUserId?.id });
            })

            return { ...user, userSubscribedToProfiles }
        })

        return userWithSubscription
    }

    static async getUserWithSubscribeToById(fastify: TFastify, userId: string) {
        const user = await fastify.db.users.findOne({ key: 'id', equals: userId });
        const posts = await fastify.db.posts.findMany({ key: 'userId', equals: userId });
        const profiles = await fastify.db.profiles.findMany({ key: 'userId', equals: userId });

        const subscribedToPosts = user?.subscribedToUserIds?.map(async (_userId) => {
            const subscribedUser = await fastify.db.users.findOne({ key: 'id', equals: _userId });
            if (subscribedUser?.id) {

                const subscribedPosts = await fastify.db.posts.findMany({ key: 'userId', equals: subscribedUser?.id });
                return subscribedPosts
            }
            return []
        })

        return { ...user, posts, profiles, subscribedToPosts };
    }

    static async getUsersWithSubscriptions(fastify: TFastify) {
        const users = await fastify.db.users.findMany();

        const fullUsers = users?.map((user) => {
            const subscribedToUserUsers = user?.subscribedToUserIds?.map(async (userId) => {
                const subscribedUser = await fastify.db.users.findOne({ key: 'id', equals: userId });

                return subscribedUser
            })

            const userSubscribedToUsers = users?.filter(
                (_user) => _user?.subscribedToUserIds?.includes(user?.id)
            )

            return { ...user, userSubscribedToUsers, subscribedToUserUsers }
        })

        const fullUsersWithTHeirSubscriptions = fullUsers.map(async (_fullUser) => {
            const { userSubscribedToUsers, subscribedToUserUsers } = await _fullUser

            const fullUserSubscribedToUsers = userSubscribedToUsers?.map((_userSubscribedToUser) => {
                return fullUsers?.find(async (_user) => (await _user)?.id === _userSubscribedToUser?.id)
            })

            const fullSubscribedToUserUsers = subscribedToUserUsers?.map((_subscribedToUserUser) => {
                return fullUsers?.find(async (_user) => (await _user)?.id === (await _subscribedToUserUser)?.id)
            })

            return { ..._fullUser, userSubscribedToUsers: fullUserSubscribedToUsers, subscribedToUserUsers: fullSubscribedToUserUsers }
        })

        return fullUsersWithTHeirSubscriptions;
    }

    static async createUser(fastify: TFastify, userDTO: CreateUserDTO) {
        return fastify.db.users.create(userDTO);
    }

    static async createProfile(fastify: TFastify, profileDTO: CreateProfileDTO) {
        return fastify.db.profiles.create(profileDTO);
    }

    static async createPost(fastify: TFastify, postDTO: CreatePostDTO) {
        return fastify.db.posts.create(postDTO);
    }

    static async updateUser(fastify: TFastify, userDTO: ChangeUserDTO & { id: string }) {
        const { id: userId, firstName, lastName, email } = userDTO

        if (uuid.validate(userDTO?.id)) {
            const user = await fastify.db.users.findOne({ key: 'id', equals: userId })

            if (user) {

                const { firstName: _firstName, lastName: _lastName, email: _email } = user

                return fastify.db.users.change(userId, { firstName: firstName || _firstName, lastName: lastName || _lastName, email: email || _email })
            }
            return null

        }
    }

    static async updateProfile(fastify: TFastify, profileDTO: ChangeProfileDTO & { id: string }) {
        const { id: profileId, avatar, sex, birthday, country, street, city, memberTypeId } = profileDTO

        if (uuid.validate(profileId)) {
            const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId })
            if (profile) {

                const {
                    avatar: _avatar,
                    sex: _sex,
                    birthday: _birthday,
                    country: _country,
                    street: _street,
                    city: _city,
                    memberTypeId: _memberTypeId
                } = profileDTO

                return fastify.db.profiles.change(profileId, {
                    avatar: avatar || _avatar,
                    sex: sex || _sex,
                    birthday: birthday || _birthday,
                    country: country || _country,
                    street: street || _street,
                    city: city || _city,
                    memberTypeId: memberTypeId || _memberTypeId
                })
            }

            return null
        }
    }

    static async updatePost(fastify: TFastify, postDTO: ChangePostDTO & { id: string }) {
        const { id: postId, title, content } = postDTO

        if (uuid.validate(postId)) {
            const post = await fastify.db.posts.findOne({ key: 'id', equals: postId })

            if (post) {
                const { title: _title, content: _content } = post

                return fastify.db.posts.change(postId, { title: title || _title, content: content || _content })
            }

            return null
        }
    }

    static async updateMemberType(fastify: TFastify, memberTypeDTO: CreateMemberTypeDTO) {
        const { id: memberId, discount, monthPostsLimit } = memberTypeDTO

        if (typeof memberId === 'string') {
            const member = await fastify.db.memberTypes.findOne({ key: 'id', equals: memberId })

            if (member) {
                const { discount: _discount, monthPostsLimit: _monthPostsLimit } = memberTypeDTO

                return fastify.db.memberTypes.change(memberId, {
                    discount: discount || _discount,
                    monthPostsLimit: monthPostsLimit || _monthPostsLimit
                })
            }

            return null
        }
    }

    static async subscribeTo(fastify: TFastify, idsDTO: { userId: string, paramsId: string }) {
        const { userId, paramsId } = idsDTO

        const mainUser = await fastify.db.users.findOne({ key: 'id', equals: userId })

        if (mainUser) {
            mainUser.subscribedToUserIds = [...mainUser?.subscribedToUserIds, paramsId]

            return fastify.db.users.change(userId, mainUser)
        }

        return null
    }

    static async unSubscribeTo(fastify: TFastify, idsDTO: { userId: string, paramsId: string }) {
        const { userId, paramsId } = idsDTO

        if (uuid.validate(userId) && uuid.validate(paramsId)) {
            const mainUser = await fastify.db.users.findOne({ key: 'id', equals: userId })

            if (mainUser && mainUser?.subscribedToUserIds?.includes(paramsId)) {
                mainUser.subscribedToUserIds = mainUser?.subscribedToUserIds.filter((_id) => _id !== paramsId)

                return fastify.db.users.change(userId, mainUser)
            }

            return null
        }

        return null
    }
}
