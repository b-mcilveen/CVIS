void print_multiple(int number, int count) 
{
    for(int i = 0; i < count; i++) 
    {
        printf("%d\t", number);
    }
    printf("%n");
}

int main() 
{
    print_multiple(5, 5);
}
