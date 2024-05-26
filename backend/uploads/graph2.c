#include <stdio.h>
#include <stdlib.h>
#include <time.h>


int visited[7]={0};
int adj[7][7]={
    {0,1,1,1,0,0,0},
    {1,0,1,0,0,0,0},
    {1,1,0,1,1,0,0},
    {1,0,1,0,1,0,0},
    {0,0,1,1,0,1,1},
    {0,0,0,0,1,0,0},
    {0,0,0,0,1,0,0}
};

void DFS(int node){
    printf("%d ",node);
    visited[node]=1;
    for(int j=0;j<7;j++){
        if(adj[node][j] && !visited[j]){
            DFS(j);
        }
    }
}

int main(){
    // implementing DFS
    printf("Starting from value 4 | DFS traversal:\n");
    DFS(4);
    time_t currentTime;
    time(&currentTime);
    printf("\nCurrent Date and Time: %s", asctime(localtime(&currentTime)));
    scanf("%d");
    return 0; 
}