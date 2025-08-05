import React from 'react';
import apiClient from "@/lib/api-client";

const ServerPage = async () => {

    const data = await apiClient.getD("/api/vacancies");

    return (
        <div>
            {JSON.stringify(data, null, 2)}
        </div>
    );
};

export default ServerPage;