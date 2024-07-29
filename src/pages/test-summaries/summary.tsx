import React from 'react';
import {List, useTable} from "@refinedev/antd";
import {Button, Col, Row, Space, Table, Tag} from "antd";
import {HttpError} from "@refinedev/core";
import {IProjects} from "./interfaces";

export const TestSummary = () => {
    const {tableProps} = useTable<IProjects, HttpError>({
        resource: "projects/",
    });
    return (
        <List
            title={"Test Summaries"}
        >
           <List
               title={"Projects"}
               >
               <Table {...tableProps} rowKey="project" >
                   <Table.Column title="Project Name"
                                 dataIndex="project"/>
               </Table>

           </List>
        </List>
    );
};
export default TestSummary;
