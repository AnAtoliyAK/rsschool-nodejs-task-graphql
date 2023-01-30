import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, Source } from 'graphql';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { graphqlBodySchema } from './schema';
import uuid = require('uuid');
import { UserGraphQLType, ProfileGraphQLType, PostGraphQLType, MemberGraphQLType, FullUserGraphQLType, FullUserWithSubscriptionsGraphQLType } from './types/DtoTypes';
import { CreateUserGraphQLInputType, CreateProfileGraphQLInputType, CreatePostGraphQLInputType, UpdateUserGraphQLInputType, UpdateProfileGraphQLInputType, UpdatePostGraphQLInputType, UpdateMemberGraphQLInputType, SubscribeToGraphQLInputType, UnSubscribeToGraphQLInputType } from './types/InputTypes';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {

  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const source: string | Source = String(request.body.query!);
      const variableValues = request.body.variables!;

      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: "GetAllEntities",
          fields: () => ({
            users: {
              type: new GraphQLList(UserGraphQLType),
              resolve() {
                return fastify.db.users.findMany();
              },
            },
            profiles: {
              type: new GraphQLList(ProfileGraphQLType),
              resolve() {
                return fastify.db.profiles.findMany();
              },
            },
            posts: {
              type: new GraphQLList(PostGraphQLType),
              resolve() {
                return fastify.db.posts.findMany();
              },
            },
            memberTypes: {
              type: new GraphQLList(MemberGraphQLType),
              resolve() {
                return fastify.db.memberTypes.findMany();
              },
            },
            user: {
              type: new GraphQLNonNull(UserGraphQLType),
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: (_, args) => {
                return fastify.db.users.findOne({ key: 'id', equals: args.id });
              }
            },
            profile: {
              type: new GraphQLNonNull(ProfileGraphQLType),
              args: {
                id: { type: new GraphQLNonNull(GraphQLString), },
              },
              resolve: (_, args) => {
                return fastify.db.memberTypes.findOne({ key: 'id', equals: args.id });
              },
            },
            post: {
              type: new GraphQLNonNull(PostGraphQLType),
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: (_, args) => {
                return fastify.db.posts.findOne({ key: 'id', equals: args.id });
              },
            },
            memberType: {
              type: MemberGraphQLType,
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: (_, args) => {
                return fastify.db.memberTypes.findOne({ key: 'id', equals: args.id });
              },
            },
            fullUsers: {
              type: new GraphQLList(FullUserGraphQLType),
              async resolve() {
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
              },
            },
            fullUser: {
              type: FullUserGraphQLType,
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              async resolve(_, args) {
                const user = await fastify.db.users.findOne({ key: 'id', equals: args.id });
                const posts = await fastify.db.posts.findMany({ key: 'userId', equals: args.id });
                const profiles = await fastify.db.profiles.findMany({ key: 'userId', equals: args.id });
                const memberTypes = profiles?.map(async (profile) => {
                  return await fastify.db.memberTypes.findMany({ key: 'id', equals: profile.memberTypeId });
                })

                return { ...user, posts, profiles, memberTypes };
              },
            },
            usersWithSubscribedTo: {
              type: new GraphQLList(FullUserGraphQLType),
              async resolve() {
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
              },
            },
            userWithHisSubscribedTo: {
              type: FullUserGraphQLType,
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              async resolve(_, args) {
                const user = await fastify.db.users.findOne({ key: 'id', equals: args.id });
                const posts = await fastify.db.posts.findMany({ key: 'userId', equals: args.id });
                const profiles = await fastify.db.profiles.findMany({ key: 'userId', equals: args.id });

                const subscribedToPosts = user?.subscribedToUserIds?.map(async (userId) => {
                  const subscribedUser = await fastify.db.users.findOne({ key: 'id', equals: userId });
                  if (subscribedUser?.id) {

                    const subscribedPosts = await fastify.db.posts.findMany({ key: 'userId', equals: subscribedUser?.id });
                    return subscribedPosts
                  }
                  return []
                })

                return { ...user, posts, profiles, subscribedToPosts };
              },
            },
            usersWithSubscriptions: {
              type: new GraphQLList(FullUserWithSubscriptionsGraphQLType),
              async resolve() {
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
              },
            },
          }),
        }),
        mutation: new GraphQLObjectType({
          name: "TODO_some_name",
          fields: () => ({
            createUser: {
              type: UserGraphQLType,
              args: {
                userDTO: { type: CreateUserGraphQLInputType },
              },
              resolve: async (_, { userDTO }) => {
                const user = await fastify.db.users.create(userDTO);

                return user;
              },
            },
            createProfile: {
              type: ProfileGraphQLType,
              args: {
                profileDTO: { type: CreateProfileGraphQLInputType },
              },
              resolve: async (_, { profileDTO }) => {
                const profile: ProfileEntity = await fastify.db.profiles.create(profileDTO);

                return profile;
              },
            },
            createPost: {
              type: PostGraphQLType,
              args: {
                postDTO: { type: CreatePostGraphQLInputType }
              },
              resolve: async (_, { postDTO }) => {
                const post = await fastify.db.posts.create(postDTO);

                return post;
              },
            },
            updateUser: {
              type: UserGraphQLType,
              args: {
                userDTO: { type: UpdateUserGraphQLInputType }
              },
              resolve: async (_, { userDTO }) => {
                const { id: userId, firstName, lastName, email } = userDTO

                if (uuid.validate(userDTO?.id)) {
                  const user = await fastify.db.users.findOne({ key: 'id', equals: userId })

                  if (user) {

                    const { firstName: _firstName, lastName: _lastName, email: _email } = user

                    return fastify.db.users.change(userId, { firstName: firstName || _firstName, lastName: lastName || _lastName, email: email || _email })
                  }
                  return null

                }
              },
            },
            updateProfile: {
              type: ProfileGraphQLType,
              args: {
                profileDTO: { type: UpdateProfileGraphQLInputType }
              },
              resolve: async (_, { profileDTO }) => {
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
              },
            },
            updatePost: {
              type: PostGraphQLType,
              args: {
                postDTO: { type: UpdatePostGraphQLInputType }
              },
              resolve: async (_, { postDTO }) => {
                const { id: postId, title, content } = postDTO

                if (uuid.validate(postId)) {
                  const post = await fastify.db.posts.findOne({ key: 'id', equals: postId })

                  if (post) {
                    const { title: _title, content: _content } = post

                    return fastify.db.posts.change(postId, { title: title || _title, content: content || _content })
                  }

                  return null
                }
              },
            },
            updateMemberType: {
              type: MemberGraphQLType,
              args: {
                memberTypeDTO: { type: UpdateMemberGraphQLInputType }
              },
              resolve: async (_, { memberTypeDTO }) => {
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
              },
            },
            subscribeToInputType: {
              type: UserGraphQLType,
              args: {
                subscribeToTypeDTO: { type: SubscribeToGraphQLInputType }
              },
              resolve: async (_, { memberTypeDTO }) => {
                const { userId, paramsId } = memberTypeDTO

                const mainUser = await fastify.db.users.findOne({ key: 'id', equals: userId })

                if (mainUser) {
                  mainUser.subscribedToUserIds = [...mainUser?.subscribedToUserIds, paramsId]

                  return fastify.db.users.change(userId, mainUser)
                }

                return null
              },
            },
            unSubscribeToInputType: {
              type: UserGraphQLType,
              args: {
                usSubscribeToTypeDTO: { type: UnSubscribeToGraphQLInputType }
              },
              resolve: async (_, { memberTypeDTO }) => {
                const { userId, paramsId } = memberTypeDTO

                if (uuid.validate(userId) && uuid.validate(paramsId)) {
                  const mainUser = await fastify.db.users.findOne({ key: 'id', equals: userId })

                  if (mainUser && mainUser?.subscribedToUserIds?.includes(paramsId)) {
                    mainUser.subscribedToUserIds = mainUser?.subscribedToUserIds.filter((_id) => _id !== paramsId)

                    return fastify.db.users.change(userId, mainUser)
                  }

                  return null
                }

                return null
              },
            },
          }),
        }),
      });

      return await graphql({ schema, source, variableValues });
    }
  );
};

export default plugin;
