class Solution {
public:
    int minAddToMakeValid(string s) {
        int a=0,b=0;
        for(char c:s){
            if(c=='('){
                a++;
            }
            else{
                if(a>0){
                    a--;
                }
                else{
                    b++;
                }
            }
        }
        return a+b;
    }
};