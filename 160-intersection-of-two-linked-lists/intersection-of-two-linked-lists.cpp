/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode *getIntersectionNode(ListNode *headA, ListNode *headB) {
        ListNode* temp1=headA;
        ListNode* temp2=headB;
        int count1=0;
        while(temp1!=NULL){
            count1++;
            temp1=temp1->next;
        }
        // cout<<count1;
        int count2=0;
        while(temp2!=NULL){
            count2++;
            temp2=temp2->next;
        }
        temp1=headA;
        temp2=headB;
        int x;
        if(count1>count2){
            x=count1-count2;
            for(int i=0;i<x; i++){
            temp1=temp1->next;}
        
        }
        
        else{
            int y;
            y=count2-count1;
            for(int i=0;i<y; i++){
            temp2=temp2->next;}
        
        
        }
        while(temp2!=NULL){
            if(temp1==temp2){
                return temp2;}
            temp1=temp1->next;
            temp2=temp2->next;
            
        }

    return NULL;
    
    }
};