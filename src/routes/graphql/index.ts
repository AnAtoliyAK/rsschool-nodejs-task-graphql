import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, Source } from 'graphql';
import { graphqlBodySchema } from './schema';

const UserGraphQLType = new GraphQLObjectType({
  name: "User",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
  },
});



const ProfileGraphQLType = new GraphQLObjectType({
  name: "Profile",
  fields: {
    id: { type: GraphQLString },
    avatar: { type: GraphQLString },
    sex: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    country: { type: GraphQLString },
    street: { type: GraphQLString },
    city: { type: GraphQLString },
    memberTypeId: { type: GraphQLString },
    userId: { type: GraphQLString },
  },
});

const PostGraphQLType = new GraphQLObjectType({
  name: "Post",
  fields: {
    id: { type: GraphQLString },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    userId: { type: GraphQLString },
  },
});

const MemberGraphQLType = new GraphQLObjectType({
  name: "MemberType",
  fields: {
    id: { type: GraphQLString },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  },
});

const FullUserGraphQLType = new GraphQLObjectType({
  name: "FullUser",
  fields: {
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
    posts: { type: new GraphQLList(PostGraphQLType) },
    profiles: { type: new GraphQLList(ProfileGraphQLType) },
    memberTypes: { type: new GraphQLList(MemberGraphQLType) },
  },
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

      console.log('s', source);
      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: "GetAllEntities",
          fields: {
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
              resolve: (_, id) => {

                return fastify.db.memberTypes.findOne({ key: 'id', equals: id.id });
              }
            },
            profile: {
              type: new GraphQLNonNull(ProfileGraphQLType),
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: (_, id) => {

                return fastify.db.memberTypes.findOne({ key: 'id', equals: id.id });
              },
            },
            post: {
              type: new GraphQLNonNull(PostGraphQLType),
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: (_, id) => {

                return fastify.db.memberTypes.findOne({ key: 'id', equals: id.id });
              },
            },
            memberType: {
              type: MemberGraphQLType,
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: (_, id) => {

                return fastify.db.memberTypes.findOne({ key: 'id', equals: id.id });
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
            }
          },
        }),
        mutation: new GraphQLObjectType({
          name: "TODO_some_name",
          fields: {
            createUser: {
              type: UserGraphQLType,
              args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                email: { type: GraphQLString },
              },
              resolve: async (_, args) => {
                const user = await fastify.db.users.create(args);
                return user;
              },
            },
            createProfile: {
              type: ProfileGraphQLType,
              args: {
                avatar: { type: GraphQLString },
                sex: { type: GraphQLString },
                birthday: { type: GraphQLString },
                country: { type: GraphQLString },
                street: { type: GraphQLString },
                city: { type: GraphQLString },
                memberTypeId: { type: GraphQLString },
                userId: { type: GraphQLString },
              },
              resolve: async (_, args) => {
                const profile = await fastify.db.profiles.create(args);
                return profile;
              },
            },
            createPost: {
              type: PostGraphQLType,
              args: {
                title: { type: GraphQLString },
                content: { type: GraphQLString },
                userId: { type: GraphQLString },
              },
              resolve: async (_, args) => {
                const post = await fastify.db.posts.create(args);
                return post;
              },
            },

          },
        }),
      });

      return await graphql({ schema, source });
    }
  );
};

export default plugin;
