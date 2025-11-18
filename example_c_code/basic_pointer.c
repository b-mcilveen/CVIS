int main()
{
    int a = 5;
    int *ptr = &a;
    printf("Pointer value: %d", *ptr);
    *ptr = 1;
    printf("Pointer dereferenced value: %d", *ptr);
}