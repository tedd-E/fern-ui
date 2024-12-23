import {ISpecRun, ISuiteRun, ITag, ITestRun} from "./interfaces";
import {Space, Table, Tag} from "antd";
import React from "react";
import moment from "moment/moment";
import uniqolor from 'uniqolor';

export const calculateDuration = (start: moment.MomentInput, end: moment.MomentInput) => {
    const duration = moment(end).diff(moment(start));
    return moment.duration(duration).humanize();
};

export const testRunsStatus = (testRun: ITestRun) => {
    const statusMap = new Map<string, number>();

    const passedSpecRuns = testRun.suite_runs
        .flatMap(suiteRun => suiteRun.spec_runs)
        .filter(specRun => specRun.status === 'passed')
        .length;
    const failedSpecRuns = testRun.suite_runs
        .flatMap(suiteRun => suiteRun.spec_runs)
        .filter(specRun => specRun.status === 'failed')
        .length;
    const skippedSpecRuns = testRun.suite_runs
        .flatMap(suiteRun => suiteRun.spec_runs)
        .filter(specRun => specRun.status === 'skipped')
        .length;

    statusMap.set('passed', passedSpecRuns);
    statusMap.set('failed', failedSpecRuns);
    statusMap.set('skipped', skippedSpecRuns);

    return statusMap;
}



export const uniqueTags = (specRuns: ISpecRun[]) => {
    const tags: ITag[] = [];

    specRuns.forEach(specRun => {
        specRun.tags.forEach(tag => {
            if (!tags.some(t => t.id === tag.id)) {
                tags.push(tag);
            }
        });
    });

    return tags;
}

export const generateTagColor = (tag: string) => {
    return uniqolor(tag).color;
}

export const calculateSpecRuns = (testRun: ITestRun) => {
    const totalSpecRuns = testRun.suite_runs
        .flatMap(suiteRun => suiteRun.spec_runs)
        .filter(specRun => specRun.status !== 'skipped')
        .length;

    const passedSpecRuns = testRun.suite_runs
        .flatMap(suiteRun => suiteRun.spec_runs)
        .filter(specRun => specRun.status === 'passed')
        .length;

    return `${passedSpecRuns}/${totalSpecRuns}`;
}


export const expandedRowRender = (testRun: ITestRun) => (
    <>
        {testRun.suite_runs.map((suiteRun, suiteIndex) =>
            <Table dataSource={suiteRun.spec_runs.filter(specRun => specRun.status !== 'skipped')} // Remove skipped tests
                   pagination={false}
                   key={suiteIndex}>
                rowKey="id"
                <Table.Column title="Test ID"
                              dataIndex="id"
                              width={50}
                              key="id"/>
                <Table.Column title="Suite Name"
                              dataIndex="suite_name"
                              key="suite_name"
                              width={200}
                              render={() => suiteRun.suite_name}/>
                <Table.Column title="Spec Description"
                              dataIndex="spec_description"
                              width={400}
                              key="spec_description"/>
                <Table.Column title="Message"
                              dataIndex="message"
                              key="message"
                              width={200}
                              render={(message: string) => (
                                  <div>
                                      <pre style={{
                                          whiteSpace: "pre",
                                          overflowX: "auto",
                                          maxHeight: "500px",
                                      }}>
                                         {message}
                                     </pre>
                                  </div>
                              )}
                />
                <Table.Column title="Status"
                              key="status"
                              width={100}
                              render={(_text, record: ISpecRun) => {
                                  if (record.status === 'failed') {
                                      return <Tag color="red">Failed</Tag>;
                                  } else {
                                      return <Tag color="green">Passed</Tag>;
                                  }
                              }}
                />
                <Table.Column title="Duration"
                              key="duration"
                              width={120}
                              render={(_text, record: ISpecRun) => calculateDuration(record.start_time, record.end_time)}/>
                <Table.Column title="Tags"
                              key="tags"
                              width={200}
                              render={(_text, record: ISpecRun) => (
                                  <Space>
                                      {record.tags.map((tag: ITag, _) => (
                                          <Tag color={generateTagColor(tag.name)} key={tag.id}>{tag.name}</Tag>
                                      ))}
                                  </Space>
                              )}/>
            </Table>
        )}
    </>
);
