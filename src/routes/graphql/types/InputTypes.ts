import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLInt } from 'graphql';

export const CreateUserGraphQLInputType = new GraphQLInputObjectType({
    name: "createUserInputType",
    fields: () => ({
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
    }),
});

export const CreateProfileGraphQLInputType = new GraphQLInputObjectType({
    name: "createProfileInputType",
    fields: () => ({
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

export const CreatePostGraphQLInputType = new GraphQLInputObjectType({
    name: "createPostInputType",
    fields: () => ({
        title: { type: new GraphQLNonNull(GraphQLString) },
        content: { type: new GraphQLNonNull(GraphQLString) },
        userId: { type: new GraphQLNonNull(GraphQLString) },
    }),
});


export const UpdateUserGraphQLInputType = new GraphQLInputObjectType({
    name: "updateUserInputType",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
    }),
});

export const UpdateProfileGraphQLInputType = new GraphQLInputObjectType({
    name: "updateProfileInputType",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        avatar: { type: GraphQLString },
        sex: { type: GraphQLString },
        birthday: { type: GraphQLInt },
        country: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        memberTypeId: { type: GraphQLString },
    }),
});

export const UpdatePostGraphQLInputType = new GraphQLInputObjectType({
    name: "updatePostInputType",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
    }),
});

export const UpdateMemberGraphQLInputType = new GraphQLInputObjectType({
    name: "updateMemberTypeInputType",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString) },
        discount: { type: GraphQLInt },
        monthPostsLimit: { type: GraphQLInt },
    }),
});

export const SubscribeToGraphQLInputType = new GraphQLInputObjectType({
    name: "subscribeToInputType",
    fields: () => ({
        userId: { type: new GraphQLNonNull(GraphQLString) },
        paramsId: { type: new GraphQLNonNull(GraphQLString) },
    }),
});

export const UnSubscribeToGraphQLInputType = new GraphQLInputObjectType({
    name: "unSubscribeToInputType",
    fields: () => ({
        userId: { type: new GraphQLNonNull(GraphQLString) },
        paramsId: { type: new GraphQLNonNull(GraphQLString) },
    }),
});
