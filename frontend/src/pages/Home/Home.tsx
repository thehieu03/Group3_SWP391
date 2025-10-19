import { useEffect, useState } from "react";
import type { CategoriesResponse } from "../../models/modelResponse/CategoriesResponse.tsx";
import { categoryServices } from "../../services/CategoryServices.tsx";
import axios from "axios";

const Home = () => {
  const [categories, setCategories] = useState<CategoriesResponse[]>([]);
  useEffect(() => {
    axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
    const fetchApi = async () => {
      try {
        const result = await categoryServices.getAllCategory();
        setCategories(result);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        // Optionally set some error state here
      }
    };
    void fetchApi();
  }, []);
  console.log(categories);
  return (
    <div>
      <h1>
        {categories.map((item) => {
          return <div key={item.id}>{item.name}</div>;
        })}
      </h1>
    </div>
  );
};

export default Home;
