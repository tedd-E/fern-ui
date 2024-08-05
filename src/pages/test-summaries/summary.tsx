import React, { useState } from 'react';
import { List, useTable } from "@refinedev/antd";
import { Card, Pagination, Row, Col } from "antd";
import { HttpError, BaseRecord } from "@refinedev/core";
import {IProject} from "./interfaces";


export const TestSummary = () => {
    const { tableProps } = useTable<IProject, HttpError>({
        resource: "projects/",
    });

    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 6;

    const projectData: IProject[] = (tableProps.dataSource || []).map((projectName, index) => ({
        id: index, // need this cause IProject extends Baserecord
        project: projectName as unknown as string,  //TODO: not good practice, need to fix this
    }));

    const startIndex = (currentPage - 1) * cardsPerPage; // calculate paginated data
    const endIndex = startIndex + cardsPerPage;
    const paginatedData = projectData.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <List title={"Test Result Overview"}>
            <Row gutter={16}>
                {paginatedData.map((project) => (
                    <Col span={24} key={project.id}>
                        <Card
                            hoverable
                            title={project.project}
                            style={{ textAlign: 'center', marginBottom: '16px', width: '100%'  }}
                        >
                            TODO: put the grid here!
                        </Card>
                    </Col>
                ))}
            </Row>
            <Pagination
                current={currentPage}
                pageSize={cardsPerPage}
                total={projectData.length}
                onChange={handlePageChange}
                style={{ marginTop: '16px', textAlign: 'center' }}
            />
        </List>
    );
};
