/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    int maxdia=0;
    int level(TreeNode* root){
        if(root==NULL){return 0;}
        return 1+max(level(root->left),level(root->right));
    }
    int helper(TreeNode* root){
        if(root==NULL){
            return 0;
        }
        int dia=level(root->left)+level(root->right);
        maxdia=max(maxdia,dia);
        helper(root->left);
        helper(root->right);
        return maxdia;
    }
    int diameterOfBinaryTree(TreeNode* root) {
        maxdia=0;
        return helper(root);
    }
};