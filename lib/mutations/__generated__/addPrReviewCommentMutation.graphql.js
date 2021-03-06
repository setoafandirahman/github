/**
 * @flow
 * @relayHash 565ec2aecd4101a6f349746557180729
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type emojiReactionsController_reactable$ref = any;
export type AddPullRequestReviewCommentInput = {|
  pullRequestReviewId: string,
  commitOID?: ?any,
  body: string,
  path?: ?string,
  position?: ?number,
  inReplyTo?: ?string,
  clientMutationId?: ?string,
|};
export type addPrReviewCommentMutationVariables = {|
  input: AddPullRequestReviewCommentInput
|};
export type addPrReviewCommentMutationResponse = {|
  +addPullRequestReviewComment: ?{|
    +commentEdge: ?{|
      +node: ?{|
        +id: string,
        +author: ?{|
          +avatarUrl: any,
          +login: string,
        |},
        +bodyHTML: any,
        +isMinimized: boolean,
        +viewerCanReact: boolean,
        +path: string,
        +position: ?number,
        +createdAt: any,
        +url: any,
        +$fragmentRefs: emojiReactionsController_reactable$ref,
      |}
    |}
  |}
|};
export type addPrReviewCommentMutation = {|
  variables: addPrReviewCommentMutationVariables,
  response: addPrReviewCommentMutationResponse,
|};
*/


/*
mutation addPrReviewCommentMutation(
  $input: AddPullRequestReviewCommentInput!
) {
  addPullRequestReviewComment(input: $input) {
    commentEdge {
      node {
        id
        author {
          __typename
          avatarUrl
          login
          ... on Node {
            id
          }
        }
        bodyHTML
        isMinimized
        viewerCanReact
        path
        position
        createdAt
        url
        ...emojiReactionsController_reactable
      }
    }
  }
}

fragment emojiReactionsController_reactable on Reactable {
  id
  ...emojiReactionsView_reactable
}

fragment emojiReactionsView_reactable on Reactable {
  id
  reactionGroups {
    content
    viewerHasReacted
    users {
      totalCount
    }
  }
  viewerCanReact
}
*/

const node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "LocalArgument",
    "name": "input",
    "type": "AddPullRequestReviewCommentInput!",
    "defaultValue": null
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input",
    "type": "AddPullRequestReviewCommentInput!"
  }
],
v2 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "id",
  "args": null,
  "storageKey": null
},
v3 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "avatarUrl",
  "args": null,
  "storageKey": null
},
v4 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "login",
  "args": null,
  "storageKey": null
},
v5 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "bodyHTML",
  "args": null,
  "storageKey": null
},
v6 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "isMinimized",
  "args": null,
  "storageKey": null
},
v7 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "viewerCanReact",
  "args": null,
  "storageKey": null
},
v8 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "path",
  "args": null,
  "storageKey": null
},
v9 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "position",
  "args": null,
  "storageKey": null
},
v10 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "createdAt",
  "args": null,
  "storageKey": null
},
v11 = {
  "kind": "ScalarField",
  "alias": null,
  "name": "url",
  "args": null,
  "storageKey": null
};
return {
  "kind": "Request",
  "fragment": {
    "kind": "Fragment",
    "name": "addPrReviewCommentMutation",
    "type": "Mutation",
    "metadata": null,
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "addPullRequestReviewComment",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "AddPullRequestReviewCommentPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "commentEdge",
            "storageKey": null,
            "args": null,
            "concreteType": "PullRequestReviewCommentEdge",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "PullRequestReviewComment",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "author",
                    "storageKey": null,
                    "args": null,
                    "concreteType": null,
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      (v4/*: any*/)
                    ]
                  },
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "kind": "FragmentSpread",
                    "name": "emojiReactionsController_reactable",
                    "args": null
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "operation": {
    "kind": "Operation",
    "name": "addPrReviewCommentMutation",
    "argumentDefinitions": (v0/*: any*/),
    "selections": [
      {
        "kind": "LinkedField",
        "alias": null,
        "name": "addPullRequestReviewComment",
        "storageKey": null,
        "args": (v1/*: any*/),
        "concreteType": "AddPullRequestReviewCommentPayload",
        "plural": false,
        "selections": [
          {
            "kind": "LinkedField",
            "alias": null,
            "name": "commentEdge",
            "storageKey": null,
            "args": null,
            "concreteType": "PullRequestReviewCommentEdge",
            "plural": false,
            "selections": [
              {
                "kind": "LinkedField",
                "alias": null,
                "name": "node",
                "storageKey": null,
                "args": null,
                "concreteType": "PullRequestReviewComment",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "author",
                    "storageKey": null,
                    "args": null,
                    "concreteType": null,
                    "plural": false,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "__typename",
                        "args": null,
                        "storageKey": null
                      },
                      (v3/*: any*/),
                      (v4/*: any*/),
                      (v2/*: any*/)
                    ]
                  },
                  (v5/*: any*/),
                  (v6/*: any*/),
                  (v7/*: any*/),
                  (v8/*: any*/),
                  (v9/*: any*/),
                  (v10/*: any*/),
                  (v11/*: any*/),
                  {
                    "kind": "LinkedField",
                    "alias": null,
                    "name": "reactionGroups",
                    "storageKey": null,
                    "args": null,
                    "concreteType": "ReactionGroup",
                    "plural": true,
                    "selections": [
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "content",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "ScalarField",
                        "alias": null,
                        "name": "viewerHasReacted",
                        "args": null,
                        "storageKey": null
                      },
                      {
                        "kind": "LinkedField",
                        "alias": null,
                        "name": "users",
                        "storageKey": null,
                        "args": null,
                        "concreteType": "ReactingUserConnection",
                        "plural": false,
                        "selections": [
                          {
                            "kind": "ScalarField",
                            "alias": null,
                            "name": "totalCount",
                            "args": null,
                            "storageKey": null
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  "params": {
    "operationKind": "mutation",
    "name": "addPrReviewCommentMutation",
    "id": null,
    "text": "mutation addPrReviewCommentMutation(\n  $input: AddPullRequestReviewCommentInput!\n) {\n  addPullRequestReviewComment(input: $input) {\n    commentEdge {\n      node {\n        id\n        author {\n          __typename\n          avatarUrl\n          login\n          ... on Node {\n            id\n          }\n        }\n        bodyHTML\n        isMinimized\n        viewerCanReact\n        path\n        position\n        createdAt\n        url\n        ...emojiReactionsController_reactable\n      }\n    }\n  }\n}\n\nfragment emojiReactionsController_reactable on Reactable {\n  id\n  ...emojiReactionsView_reactable\n}\n\nfragment emojiReactionsView_reactable on Reactable {\n  id\n  reactionGroups {\n    content\n    viewerHasReacted\n    users {\n      totalCount\n    }\n  }\n  viewerCanReact\n}\n",
    "metadata": {}
  }
};
})();
// prettier-ignore
(node/*: any*/).hash = 'ee13078483d102b11a0919624bd400f6';
module.exports = node;
