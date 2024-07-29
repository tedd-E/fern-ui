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
           title={"Projects"}
           >
            //TODO: populate with list of unique projects (should be paginated)
           //TODO: under each project, populate it with the green/red grid thing

       </List>

    );
};
export default TestSummary;
