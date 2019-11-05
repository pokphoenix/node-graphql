
//ref: https://blog.bitsrc.io/so-what-the-heck-is-graphql-49c27cb83754
//ref:  https://www.apollographql.com/docs/apollo-server/

const { ApolloServer, gql, PubSub } = require('apollo-server');

const pubsub = new PubSub();

const users = [
    {
      id: 1,
      fname: 'Richie',
      age: 27,
      likes: 0,
    },
    {
      id: 2,
      fname: 'Betty',
      age: 20,
      likes: 205,
    },
    {
      id: 3,
      fname: 'Joe',
      age: 28,
      likes: 10,
    },
];

const posts = [
    {
      id: 1,
      userId: 2,
      body: "Hello how are you?"
    },
    {
      id: 1,
      userId: 3,
      body: "What's up?"
    },
    {
      id: 1,
      userId: 1,
      body: "Let's learn GraphQL"
    },
    {
        id: 2,
        userId: 1,
        body: "Let's learn GraphQL 2"
    },
]

const typeDefs = gql`
  type User {
    id: Int
    fname: String
    age: Int
    likes: Int
    posts: [Post]
  }
  type Post {
    id: Int
    user: User
    body: String
  }
  type Query {
    users:[User]  
    user(id: Int!): User!
    posts: [Post]
    post(id: Int!): Post!
  }
  type Mutation {
    incrementLike(fname: String!) : [User!]
  }
  type Subscription {
    listenLikes : [User]
  }
`;


const resolvers = {
    Query: {
      users(root, args) { return users },
      user(root, args) { return users.filter(user => user.id === args.id)[0] },
      posts(root, args) { return posts },
      post(root, args) { return posts.filter(post => post.id === args.id)[0] }
    },
  
    User: {
      posts: (user) => {
        return posts.filter(post => post.userId === user.id)
      }
    },
  
    Post: {
      user: (post) => {
        return users.filter(user => user.id === post.userId)[0]
      }
    },
  
    Mutation: {
      incrementLike(parent, args) {
        users.map((user) => {
          if(user.fname === args.fname) user.likes++
          return user
        })
        pubsub.publish('LIKES', {listenLikes: users});
        return users
      }
    },
  
    Subscription: {
      listenLikes: {
        subscribe: () => pubsub.asyncIterator(['LIKES'])
      }
    }
  };

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});



//example query
/*
{
    post(id: 1) {
      body
      user{
        fname,
        age
      }
    }
  }

 //=======

 
{
  posts{
    body,
    user{
      fname
    }
  },
  users {
			id,
      fname,
      age,
      posts{
      	id,
        body
      }
  }
}



  */