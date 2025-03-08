import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table, ConfigProvider, Tabs, Popover, Spin, Button } from "antd";
import {
  getDays,
  getPeriods,
  getSubjects,
  getSpaces,
  getTeachers,
} from "../DataManagement/data.api";
import {
  getTimetable,
  llmResponse,
  getSelectedAlgorithm,
  selectAlgorithm,
} from "./timetable.api";

const ViewTimetable = () => {
  const { days, periods, subjects, teachers, spaces } = useSelector(
    (state) => state.data
  );
  const { timetable, evaluation, loading, selectedAlgorithm } = useSelector(
    (state) => state.timetable
  );
  const dispatch = useDispatch();
  const algorithms = ["GA", "CO", "RL"];
  const [nlResponse, setNlResponse] = useState("");

  useEffect(() => {
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getTimetable());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    dispatch(getSelectedAlgorithm());
  }, [dispatch]);

  useEffect(() => {
    const fetchllmresponse = async () => {
      console.log(evaluation);
      var result = null;
      if (evaluation) {
        result = await llmResponse(evaluation);
        setNlResponse(result);
      }
    };
    fetchllmresponse();
  }, [evaluation]);

  // useEffect(() => {
  //   if (llmResponse) {
  //     setNlResponse(llmResponse);
  //   }
  // }, [llmResponse]);

  const generateColumns = (days) => [
    {
      title: "Periods",
      dataIndex: "period",
      key: "period",
      width: 150,
    },
    ...days.map((day) => ({
      title: day.long_name,
      dataIndex: day.name,
      key: day.name,
      render: (value) => {
        if (value) {
          const { title, subject, room, teacher, duration } = value;
          const s = subjects?.find((s) => s.code === subject);
          const r = spaces?.find((r) => r.name === room);
          const t = teachers?.find((t) => t.id === teacher);
          const content = (
            <div>
              <p>
                <strong>Subject:</strong> {s?.long_name}
              </p>
              <p>
                <strong>Room:</strong> {r?.long_name} ({r?.code})
              </p>
              <p>
                <strong>Teacher:</strong> {t?.first_name} {t?.last_name}
              </p>
              <p>
                <strong>Duration:</strong> {duration} hours
              </p>
            </div>
          );
          return (
            <Popover content={content} title={`Details for ${day.long_name}`}>
              <div className="text-center">{title}</div>
            </Popover>
          );
        }
        return <div className="text-center">-</div>;
      },
    })),
  ];

  const generateDataSource = (semesterTimetable, days, periods, algorithm) => {
    return periods.map((period, periodIndex) => ({
      key: periodIndex,
      period: period.long_name,
      ...days.reduce((acc, day) => {
        const activity = semesterTimetable.find(
          (entry) =>
            entry.day.name === day.name &&
            entry.period.some((p) => p.name === period.name) &&
            entry?.algorithm === algorithm
        );
        acc[day.name] = activity
          ? {
              title: `${activity.subject} (${activity.room.name})`,
              subject: activity.subject,
              room: activity.room.name,
              teacher: activity.teacher,
              duration: activity.duration,
            }
          : null;
        return acc;
      }, {}),
    }));
  };

  const getSemName = (semester) => {
    const year = parseInt(semester.substring(3, 4));
    const sem = parseInt(semester.substring(4, 6));
    return {
      year,
      sem,
    };
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-6xl mx-auto">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <Spin />
        </div>
      )}

      {!loading &&
        algorithms.map((algorithm) => {
          console.log(selectedAlgorithm?.selected_algorithm);
          return (
            <div className="mb-20">
              <div className="flex justify-between">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  Timetable (
                  {algorithm == "GA"
                    ? "Genetic algorithms"
                    : algorithm == "CO"
                    ? "Ant Colony Optimization"
                    : "Reinforcement Learning"}
                  )
                </h2>
                {selectedAlgorithm?.selected_algorithm === algorithm ? (
                  <div className="text-green-500">Selected</div>
                ) : (
                  <Button
                    type="default"
                    onClick={() => {
                      dispatch(selectAlgorithm(algorithm));
                      dispatch(getSelectedAlgorithm());
                    }}
                  >
                    Select
                  </Button>
                )}
              </div>
              <ConfigProvider
                theme={{
                  components: {
                    Tabs: {
                      itemColor: "#fff",
                    },
                  },
                }}
              >
                <Tabs type="card">
                  {timetable?.map((semesterTimetable) => {
                    const semester = semesterTimetable.semester;
                    const columns = generateColumns(days);
                    const dataSource = generateDataSource(
                      semesterTimetable.timetable,
                      days,
                      periods
                    );
                    if (semesterTimetable.algorithm !== algorithm) {
                      return;
                    }
                    return (
                      <Tabs.TabPane
                        tab={`Year ${getSemName(semester).year} Semester ${
                          getSemName(semester).sem
                        }`}
                        key={semester}
                        className="text-lightborder"
                      >
                        <ConfigProvider
                          theme={{
                            components: {
                              Table: {
                                colorBgContainer: "transparent",
                                colorText: "rgba(255,255,255,0.88)",
                                headerColor: "rgba(255,255,255,0.88)",
                                borderColor: "#2C4051",
                                headerBg: "#243546",
                              },
                            },
                          }}
                        >
                          <Table
                            columns={columns}
                            dataSource={dataSource}
                            pagination={false}
                            bordered
                            size="middle"
                            className="custom-timetable"
                          />
                        </ConfigProvider>
                      </Tabs.TabPane>
                    );
                  })}
                </Tabs>
              </ConfigProvider>
            </div>
          );
        })}
      {!loading && (
        <div className="mb-10">
          <div className="text-2xl font-semibold mb-6 text-center">
            Evaluation score
          </div>
          <div>
            <div className="center">
              Genetic Algorithm (NSGAII):{" "}
              {evaluation?.GA?.average_score.toFixed(2)}
            </div>
            <div className="center">
              Ant Colony Optimization:{" "}
              {evaluation?.CO?.average_score.toFixed(2)}
            </div>
            <div className="center">
              Reinforcement Learning: {evaluation?.RL?.average_score.toFixed(2)}
            </div>
            <div className="center">
              <strong>Recommendation:{"    "}</strong> {nlResponse}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTimetable;
