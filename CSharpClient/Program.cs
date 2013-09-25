using System;

namespace CSharpClient
{
    class Program
    {
        static void Main(string[] args)
        {
            var writer = Console.Out;
            var client = new CommonClient(writer);
            client.RunAsync("http://localhost:8080/").Wait();

            Console.ReadKey();
        }
    }
}
