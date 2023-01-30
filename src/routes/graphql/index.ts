import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString, Source } from 'graphql';
import { graphqlBodySchema } from './schema';
import { UserGraphQLType, ProfileGraphQLType, PostGraphQLType, MemberGraphQLType, FullUserGraphQLType, FullUserWithSubscriptionsGraphQLType } from './types/DtoTypes';
import { CreateUserGraphQLInputType, CreateProfileGraphQLInputType, CreatePostGraphQLInputType, UpdateUserGraphQLInputType, UpdateProfileGraphQLInputType, UpdatePostGraphQLInputType, UpdateMemberGraphQLInputType, SubscribeToGraphQLInputType, UnSubscribeToGraphQLInputType } from './types/InputTypes';
import { ResolveGraphQlService } from './resolveService/ResolveService';

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
              async resolve() {
                return await ResolveGraphQlService.getUsers(fastify);
              },
            },
            profiles: {
              type: new GraphQLList(ProfileGraphQLType),
              async resolve() {
                return await ResolveGraphQlService.getProfiles(fastify);
              },
            },
            posts: {
              type: new GraphQLList(PostGraphQLType),
              async resolve() {
                return await ResolveGraphQlService.getPosts(fastify);
              },
            },
            memberTypes: {
              type: new GraphQLList(MemberGraphQLType),
              async resolve() {
                return await ResolveGraphQlService.getMemberTypes(fastify);
              },
            },
            user: {
              type: new GraphQLNonNull(UserGraphQLType),
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: async (_, args) => {
                return await ResolveGraphQlService.getUserById(fastify, args?.id);
              }
            },
            profile: {
              type: new GraphQLNonNull(ProfileGraphQLType),
              args: {
                id: { type: new GraphQLNonNull(GraphQLString), },
              },
              resolve: async (_, args) => {
                return await ResolveGraphQlService.getProfileById(fastify, args?.id);
              },
            },
            post: {
              type: new GraphQLNonNull(PostGraphQLType),
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: async (_, args) => {
                return await ResolveGraphQlService.getPostById(fastify, args?.id);
              },
            },
            memberType: {
              type: MemberGraphQLType,
              args: {
                id: {
                  type: new GraphQLNonNull(GraphQLString),
                },
              },
              resolve: async (_, args) => {
                return await ResolveGraphQlService.getMemberTypeById(fastify, args?.id);
              },
            },
            fullUsers: {
              type: new GraphQLList(FullUserGraphQLType),
              async resolve() {
                return await ResolveGraphQlService.getFullUsers(fastify)
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
                return await ResolveGraphQlService.getFullUserById(fastify, args?.id);
              },
            },
            usersWithSubscribedTo: {
              type: new GraphQLList(FullUserGraphQLType),
              async resolve() {
                return await ResolveGraphQlService.getUsersWithSubscribeTo(fastify);
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
                return await ResolveGraphQlService.getUserWithSubscribeToById(fastify, args?.id)
              },
            },
            usersWithSubscriptions: {
              type: new GraphQLList(FullUserWithSubscriptionsGraphQLType),
              async resolve() {
                return await ResolveGraphQlService.getUsersWithSubscriptions(fastify);
              },
            },
          }),
        }),
        mutation: new GraphQLObjectType({
          name: "mutateEntities",
          fields: () => ({
            createUser: {
              type: UserGraphQLType,
              args: {
                userDTO: { type: CreateUserGraphQLInputType },
              },
              resolve: async (_, { userDTO }) => {
                return await ResolveGraphQlService.createUser(fastify, userDTO)
              },
            },
            createProfile: {
              type: ProfileGraphQLType,
              args: {
                profileDTO: { type: CreateProfileGraphQLInputType },
              },
              resolve: async (_, { profileDTO }) => {
                return await ResolveGraphQlService.createProfile(fastify, profileDTO);
              },
            },
            createPost: {
              type: PostGraphQLType,
              args: {
                postDTO: { type: CreatePostGraphQLInputType }
              },
              resolve: async (_, { postDTO }) => {
                return await ResolveGraphQlService.createPost(fastify, postDTO);
              },
            },
            updateUser: {
              type: UserGraphQLType,
              args: {
                userDTO: { type: UpdateUserGraphQLInputType }
              },
              resolve: async (_, { userDTO }) => {
                return await ResolveGraphQlService.updateUser(fastify, userDTO);
              },
            },
            updateProfile: {
              type: ProfileGraphQLType,
              args: {
                profileDTO: { type: UpdateProfileGraphQLInputType }
              },
              resolve: async (_, { profileDTO }) => {
                return await ResolveGraphQlService.updateProfile(fastify, profileDTO);
              },
            },
            updatePost: {
              type: PostGraphQLType,
              args: {
                postDTO: { type: UpdatePostGraphQLInputType }
              },
              resolve: async (_, { postDTO }) => {
                return await ResolveGraphQlService.updatePost(fastify, postDTO);
              },
            },
            updateMemberType: {
              type: MemberGraphQLType,
              args: {
                memberTypeDTO: { type: UpdateMemberGraphQLInputType }
              },
              resolve: async (_, { memberTypeDTO }) => {
                return await ResolveGraphQlService.updateMemberType(fastify, memberTypeDTO);
              },
            },
            subscribeTo: {
              type: UserGraphQLType,
              args: {
                subscribeToTypeDTO: { type: SubscribeToGraphQLInputType }
              },
              resolve: async (_, { idsDTO }) => {
                return await ResolveGraphQlService.subscribeTo(fastify, idsDTO);
              },
            },
            unSubscribeTo: {
              type: UserGraphQLType,
              args: {
                usSubscribeToTypeDTO: { type: UnSubscribeToGraphQLInputType }
              },
              resolve: async (_, { idsDTO }) => {
                return await ResolveGraphQlService.subscribeTo(fastify, idsDTO);
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
