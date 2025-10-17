using System;
using MySql.Data.MySqlClient;

namespace Mmo_Application
{
    public class DbTest
    {
        public static void Main()
        {
            string connectionString = "server=localhost;port=3306;database=mmo;user=root;password=vanh;";

            using (MySqlConnection conn = new MySqlConnection(connectionString))
            {
                try
                {
                    conn.Open();
                    Console.WriteLine("ket noi thanh cong !");
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Loi ket noi : " + ex.Message);
                }
            }
        }
    }
}
