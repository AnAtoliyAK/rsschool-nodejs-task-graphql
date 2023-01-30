import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLInputObjectType, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, Source } from 'graphql';
import { ProfileEntity } from '../../utils/DB/entities/DBProfiles';
import { graphqlBodySchema } from './schema';
import uuid = require('uuid');

const UserGraphQLType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
  }),
});

const ProfileGraphQLType = new GraphQLObjectType({
  name: "Profile",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const PostGraphQLType = new GraphQLObjectType({
  name: "Post",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const MemberGraphQLType = new GraphQLObjectType({
  name: "MemberType",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    discount: { type: new GraphQLNonNull(GraphQLInt) },
    monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});

const FullUserGraphQLType = new GraphQLObjectType({
  name: "FullUser",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLString) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    posts: { type: new GraphQLList(PostGraphQLType) },
    profiles: { type: new GraphQLList(ProfileGraphQLType) },
    memberTypes: { type: new GraphQLList(MemberGraphQLType) },
    userSubscribedToProfiles: { type: new GraphQLList(ProfileGraphQLType) },
    subscribedToPosts: { type: new GraphQLList(ProfileGraphQLType) },
    userSubscribedToUsers: { type: new GraphQLList(UserGraphQLType) },
    subscribedToUserUsers: { type: new GraphQLList(UserGraphQLType) },
  }),
});

export const CreateUserGraphQLInputType = new GraphQLInputObjectType({
  name: "createUserInputType",
  fields: () => ({
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

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
                  return fastify.db.memberTypes.findMany({ key: 'id', equals: profile.memberTypeId });
                })

                return { ...user, posts, profiles, memberTypes };
              },
            },
            userWithSubscribedTo: {
              type: FullUserGraphQLType,
              async resolve() {
                const users = await fastify.db.users.findMany();
                const userWithSubscription = users?.map(async (user) => {
                  const userSubscribedToProfiles = users?.filter(
                    (_user) => _user?.subscribedToUserIds?.includes(user?.id)
                  )?.map(async (subscribedToUserId) => {
                    return fastify.db.profiles.findMany({ key: 'userId', equals: subscribedToUserId?.id });
                  })

                  return { ...user, userSubscribedToProfiles }
                })
                return userWithSubscription;
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
              usersWithSubscriptions: {
                type: new GraphQLList(FullUserGraphQLType),
                async resolve() {
                  const users = await fastify.db.users.findMany();

                  const fullUsers = users?.map(async (user) => {
                    const subscribedToUserUsers = user?.subscribedToUserIds?.map(async (userId) => {
                      const subscribedUser = await fastify.db.users.findOne({ key: 'id', equals: userId });

                      return subscribedUser
                    })

                    const userSubscribedToUsers = users?.filter(
                      (_user) => _user?.subscribedToUserIds?.includes(user?.id)
                    )

                    return { ...user, userSubscribedToUsers, subscribedToUserUsers }
                  })

                  return fullUsers;
                },
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
                console.log('U', userDTO)
                const user = await fastify.db.users.create(userDTO);

                return user;
              },
            },
            createProfile: {
              type: ProfileGraphQLType,
              args: {
                avatar: { type: new GraphQLNonNull(GraphQLString) },
                sex: { type: new GraphQLNonNull(GraphQLString) },
                birthday: { type: new GraphQLNonNull(GraphQLInt) },
                country: { type: new GraphQLNonNull(GraphQLString) },
                street: { type: new GraphQLNonNull(GraphQLString) },
                city: { type: new GraphQLNonNull(GraphQLString) },
                memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
                userId: { type: new GraphQLNonNull(GraphQLString) },
              },
              resolve: async (_, args) => {
                const profile: ProfileEntity = await fastify.db.profiles.create(args);

                return profile;
              },
            },
            createPost: {
              type: PostGraphQLType,
              args: {
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) },
                userId: { type: new GraphQLNonNull(GraphQLString) },
              },
              resolve: async (_, args) => {
                const post = await fastify.db.posts.create(args);

                return post;
              },
            },
            updateUser: {
              type: UserGraphQLType,
              args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                email: { type: GraphQLString },
              },
              resolve: async (_, args) => {
                const { id: userId, firstName, lastName, email } = args

                if (uuid.validate(args?.id)) {
                  const user = await fastify.db.users.findOne({ key: 'id', equals: userId })

                  if (!user) {
                    return null
                  }

                  return fastify.db.users.change(userId, { firstName, lastName, email })
                }
              },
            },
            updateProfile: {
              type: ProfileGraphQLType,
              args: {
                id: { type: new GraphQLNonNull(GraphQLString) },
                avatar: { type: GraphQLString },
                sex: { type: GraphQLString },
                birthday: { type: GraphQLInt },
                country: { type: GraphQLString },
                street: { type: GraphQLString },
                city: { type: GraphQLString },
                memberTypeId: { type: GraphQLString },
              },
              resolve: async (_, args) => {
                const { id: profileId, avatar, sex, birthday, country, street, city, memberTypeId } = args

                if (uuid.validate(profileId)) {
                  const profile = await fastify.db.profiles.findOne({ key: 'id', equals: profileId })

                  if (!profile) {
                    return null
                  }

                  return fastify.db.profiles.change(profileId, { avatar, sex, birthday, country, street, city, memberTypeId })
                }
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
