import axios from "axios";

const axiosFetch = async (URL, data = {}, method = "get") => {
    try {
        const token = localStorage.getItem("token"); 
        if (!method) throw new Error("HTTP method is required."); 

        const response = await axios({
            method: method.toLowerCase(), 
            url: URL,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            data: method.toLowerCase() !== "get" ? data : undefined, 
            withCredentials: true,
        });

        return response;
    } catch (error) {
        console.error("Error in axiosFetch:", error?.response?.data || error.message); 
        throw error; 
    }
};

export default axiosFetch;
