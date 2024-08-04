import React from 'react';
import { List, useTable } from "@refinedev/antd";
import { Table } from "antd";
import { HttpError } from "@refinedev/core";

interface IProject {
    project: string;
}

export const TestSummary = () => {
    const { tableProps } = useTable<IProject, HttpError>({
        resource: "projects/",

    });

    const projectData = tableProps.dataSource?.map(project => ({
        project,
    })) || [];

    const columns = [
        {
            title: "Project",
            dataIndex: "project",
            key: "project",
        },
    ];

    return (
        <List title={"Projects"}>
            <Table
                dataSource={projectData}
                columns={columns}
                rowKey="project"
            />
                <Table.Column title="Project Name"
                    dataIndex="project"/>

        </List>
    );
};

export default TestSummary;
