import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import CsvNpsWorkspaceNav from "../components/CsvNpsWorkspaceNav";
import WorkspaceDatasetHeader from "../components/WorkspaceDatasetHeader";
import DatasetAiInsights from "../components/DatasetAiInsights";
import NpsTimeseriesChart from "../components/NpsTimeseriesChart";
import NpsBucketStackedColumns from "../components/NpsBucketStackedColumns";

const PAGE_COPY = {
  eyebrow: "NPS Me Workspace",
  title: "Performance",
  savedSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for this saved feedback dataset.",
  sessionSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for the latest browser-session dataset.",
  intercomSubtitle:
    "Review NPS results, response mix, score distribution and timeline trends for the active Intercom source in this workspace.",
};

export default function CsvNpsPerformance() {
  const { datasetId } = useParams();

  const [dataset, setDataset] = useState(null);
  const [loadingDataset, setLoadingDataset] = useState(Boolean(datasetId));
  const [datasetError, setDatasetError] = useState("");
  const [mode, setMode] = useState(datasetId ? "saved" : "unknown");

  const [periodFilter, setPeriodFilter] = useState("all");
  const [bucketFilter, setBucketFilter] = useState("all");
  const [chartGranularity, setChartGranularity] = useState("week");
  const [selectedChartPoint, setSelectedChartPoint] = useState(null);

  useEffect(() => {
    async function loadSavedDataset() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const datasetMetaRes = await fetch(
          `/api/workspace/datasets/${datasetId}`,
          {
            credentials: "include",
          }
        );

        const datasetMeta = await datasetMetaRes.json();

        if (!datasetMetaRes.ok || !datasetMeta.ok) {
          throw new Error(
            datasetMeta.error || "Failed to load saved dataset"
          );
        }

        const sourceType = String(
          datasetMeta?.dataset?.source_type || ""
        ).trim();

        if (sourceType === "workspace_intercom") {
          const performanceParams = new URLSearchParams();
          performanceParams.set("days", "365");

          const responseParams = new URLSearchParams();
          responseParams.set("limit", "5000");

          const [performanceRes, responsesRes] = await Promise.all([
            fetch(
              `/api/workspace-intercom/performance?${performanceParams.toString()}`,
              {
                credentials: "include",
              }
            ),
            fetch(
              `/api/workspace-intercom/responses?${responseParams.toString()}`,
              {
                credentials: "include",
              }
            ),
          ]);

          const [performanceData, responsesData] = await Promise.all([
            performanceRes.json(),
            responsesRes.json(),
          ]);

          if (!performanceRes.ok || !performanceData.ok) {
            throw new Error(
              performanceData.error ||
                "Failed to load workspace Intercom performance"
            );
          }

          if (!responsesRes.ok || !responsesData.ok) {
            throw new Error(
              responsesData.error ||
                "Failed to load workspace Intercom responses"
            );
          }

          setDataset(
            normaliseWorkspaceIntercomPerformanceDataset({
              dataset: datasetMeta.dataset,
              source: performanceData.source,
              performance: performanceData,
              rows: responsesData.rows,
            })
          );

          setMode("intercom");
          return;
        }

        const res = await fetch(
          `/api/workspace/datasets/${datasetId}/performance`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(
            data.error || "Failed to load saved dataset"
          );
        }

        setDataset(normaliseWorkspacePerformanceDataset(data));
        setMode("saved");
      } catch (err) {
        console.error(
          "Failed to load saved workspace dataset:",
          err
        );

        setDatasetError(
          err.message || "Failed to load saved dataset"
        );
      } finally {
        setLoadingDataset(false);
      }
    }

    async function loadActiveIntercomDataset() {
      try {
        const performanceParams = new URLSearchParams();
        performanceParams.set("days", "365");

        const responseParams = new URLSearchParams();
        responseParams.set("limit", "5000");

        const [performanceRes, responsesRes] = await Promise.all([
          fetch(
            `/api/workspace-intercom/performance?${performanceParams.toString()}`,
            {
              credentials: "include",
            }
          ),
          fetch(
            `/api/workspace-intercom/responses?${responseParams.toString()}`,
            {
              credentials: "include",
            }
          ),
        ]);

        const [performanceData, responsesData] = await Promise.all([
          performanceRes.json(),
          responsesRes.json(),
        ]);

        if (!performanceRes.ok || !performanceData.ok) {
          throw new Error(
            performanceData.error ||
              "Failed to load active Intercom performance"
          );
        }

        if (!responsesRes.ok || !responsesData.ok) {
          throw new Error(
            responsesData.error ||
              "Failed to load active Intercom responses"
          );
        }

        setDataset(
          normaliseWorkspaceIntercomPerformanceDataset({
            dataset: responsesData.dataset || {
              id: null,
              dataset_name:
                performanceData?.source?.source_name ||
                "Active Intercom source",
              source_type: "workspace_intercom",
              content_id:
                performanceData?.content_id ||
                performanceData?.source?.survey_content_id ||
                null,
              raw_row_count:
                performanceData?.summary?.total ||
                responsesData?.rows?.length ||
                0,
              valid_row_count:
                performanceData?.summary?.validResponses ||
                responsesData?.rows?.length ||
                0,
              skipped_row_count: 0,
              summary_json: performanceData?.summary || {},
            },
            source: performanceData.source,
            performance: performanceData,
            rows: responsesData.rows,
          })
        );

        setMode("intercom");
        return true;
      } catch (err) {
        console.error(
          "Failed to load active Intercom performance:",
          err
        );

        return false;
      }
    }

    function loadSessionDataset() {
      const saved = sessionStorage.getItem("csvNpsLatestDataset");

      if (!saved) {
        setDataset(null);
        return false;
      }

      try {
        const parsed = JSON.parse(saved);

        setDataset(normaliseSessionDataset(parsed));
        setMode("session");

        return true;
      } catch (err) {
        console.error(
          "Failed to read CSV NPS dataset from sessionStorage",
          err
        );

        setDatasetError(
          "Failed to read latest browser-session dataset"
        );

        return false;
      }
    }

    async function loadWithoutDatasetId() {
      setLoadingDataset(true);
      setDatasetError("");

      try {
        const loadedIntercom =
          await loadActiveIntercomDataset();

        if (!loadedIntercom) {
          loadSessionDataset();
        }
      } finally {
        setLoadingDataset(false);
      }
    }

    if (datasetId) {
      loadSavedDataset();
    } else {
      loadWithoutDatasetId();
    }
  }, [datasetId]);

  const scoreDistribution = useMemo(() => {
    const counts = Array.isArray(dataset?.scoreDistribution)
      ? dataset.scoreDistribution
      : Array.from({ length: 11 }, (_, score) => ({
          score,
          count: 0,
        }));

    const maxCount = Math.max(
      ...counts.map((item) => Number(item.count || 0)),
      1
    );

    return counts.map((item) => ({
      ...item,
      percentageOfMax: Math.round(
        (Number(item.count || 0) / maxCount) * 100
      ),
    }));
  }, [dataset]);

  const timeline = useMemo(() => {
    return Array.isArray(dataset?.timeline)
      ? dataset.timeline
      : [];
  }, [dataset]);

  const questionScores = useMemo(() => {
    return Array.isArray(dataset?.questionScores)
      ? dataset.questionScores
      : [];
  }, [dataset]);

  const performanceRows = useMemo(() => {
    const sourceRows = Array.isArray(dataset?.rows)
      ? dataset.rows
      : [];

    return sourceRows.filter((row) => {
      const matchesBucket =
        bucketFilter === "all" ||
        row.bucket === bucketFilter;

      const matchesPeriod = rowMatchesPeriod(
        row.submitted_at,
        periodFilter
      );

      return matchesBucket && matchesPeriod;
    });
  }, [dataset, bucketFilter, periodFilter]);

  const chartPoints = useMemo(() => {
    if (Array.isArray(performanceRows) && performanceRows.length > 0) {
      return buildTimeseriesFromRows(performanceRows, chartGranularity);
    }

    return Array.isArray(timeline)
      ? timeline.map((point) => ({
          date: point.date,
          responses: point.responses ?? point.total ?? 0,
          promoters: point.promoters ?? 0,
          passives: point.passives ?? 0,
          detractors: point.detractors ?? 0,
          nps: point.nps ?? null,
          average_score:
            point.average_score ??
            point.averageScore ??
            null,
        }))
      : [];
  }, [performanceRows, timeline, chartGranularity]);

  const chartTotals = useMemo(() => {
    if (!chartPoints.length) {
      return {
        totalResponses: 0,
        latestNps: null,
        latestDate: null,
        points: 0,
      };
    }

    const totalResponses = chartPoints.reduce(
      (sum, point) => sum + Number(point.responses || 0),
      0
    );

    const nonEmptyPoints = chartPoints.filter(
      (point) => Number(point.responses || 0) > 0
    );

    const latestPoint = nonEmptyPoints[nonEmptyPoints.length - 1] || null;

    return {
      totalResponses,
      latestNps: latestPoint?.nps ?? null,
      latestDate: latestPoint?.date ?? null,
      points: chartPoints.length,
    };
  }, [chartPoints]);

  const selectedChartResponses = useMemo(() => {
    if (!selectedChartPoint?.date) {
      return [];
    }

    return performanceRows
      .filter((row) =>
        rowMatchesChartPoint(
          row.submitted_at,
          selectedChartPoint.date,
          chartGranularity
        )
      )
      .sort((a, b) =>
        String(b?.submitted_at || "").localeCompare(
          String(a?.submitted_at || "")
        )
      );
  }, [performanceRows, selectedChartPoint, chartGranularity]);

  const filteredSummary = useMemo(() => {
    const filtersActive =
      periodFilter !== "all" ||
      bucketFilter !== "all";

    if (!filtersActive) {
      return (
        dataset?.summary || {
          total: 0,
          promoters: 0,
          passives: 0,
          detractors: 0,
          nps: null,
          averageScore: null,
        }
      );
    }

    return summariseRows(performanceRows);
  }, [
    performanceRows,
    dataset,
    periodFilter,
    bucketFilter,
  ]);

  const bucketPercentages = useMemo(() => {
    const total = Number(
      filteredSummary?.total || 0
    );

    if (!total) {
      return {
        promoters: 0,
        passives: 0,
        detractors: 0,
      };
    }

    return {
      promoters: Math.round(
        (Number(filteredSummary.promoters || 0) /
          total) *
          100
      ),
      passives: Math.round(
        (Number(filteredSummary.passives || 0) /
          total) *
          100
      ),
      detractors: Math.round(
        (Number(filteredSummary.detractors || 0) /
          total) *
          100
      ),
    };
  }, [filteredSummary]);

  const closeLoopSummary = useMemo(() => {
    return summariseCloseLoop(performanceRows);
  }, [performanceRows]);

  const managementSummary = useMemo(() => {
    return buildManagementSummary({
      summary: filteredSummary,
      closeLoopSummary,
      periodFilter,
      bucketFilter,
    });
  }, [
    filteredSummary,
    closeLoopSummary,
    periodFilter,
    bucketFilter,
  ]);

  const subtitle = datasetId
    ? PAGE_COPY.savedSubtitle
    : mode === "intercom"
      ? PAGE_COPY.intercomSubtitle
      : PAGE_COPY.sessionSubtitle;

  if (loadingDataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">
            {PAGE_COPY.eyebrow}
          </p>

          <h1>{PAGE_COPY.title}</h1>

          <p>Loading performance data...</p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>
            Loading performance data from workspace.
          </p>
        </section>
      </main>
    );
  }

  if (datasetError) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">
            {PAGE_COPY.eyebrow}
          </p>

          <h1>{PAGE_COPY.title}</h1>

          <p>
            There was a problem loading this dataset.
          </p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-error">
          {datasetError}
        </section>
      </main>
    );
  }

  if (!dataset) {
    return (
      <main className="csv-nps-page">
        <section className="csv-nps-hero csv-nps-hero-compact">
          <p className="eyebrow">
            {PAGE_COPY.eyebrow}
          </p>

          <h1>{PAGE_COPY.title}</h1>

          <p>
            No feedback dataset has been loaded yet.
          </p>
        </section>

        <CsvNpsWorkspaceNav />

        <section className="csv-nps-panel">
          <p>
            Go to{" "}
            <a
              className="text-link"
              href="/workspace/import"
            >
              Import feedback data
            </a>{" "}
            and analyse or save a dataset first.
          </p>
        </section>
      </main>
    );
  }

  const summary =
    filteredSummary || dataset.summary;

  return (
    <main className="csv-nps-page">
      <section className="csv-nps-hero csv-nps-hero-compact">
        <p className="eyebrow">
          {PAGE_COPY.eyebrow}
        </p>

        <h1>{PAGE_COPY.title}</h1>

        <p>{subtitle}</p>
      </section>

      <CsvNpsWorkspaceNav />

      {datasetId && (
        <WorkspaceDatasetHeader dataset={dataset} />
      )}

      <section className="csv-nps-results">
        <div className="csv-nps-filters csv-nps-filters-four">
          <label className="csv-nps-filter-field">
            <span>Period</span>

            <select
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(event.target.value)
              }
            >
              <option value="all">
                All time
              </option>

              <option value="7d">
                Last 7 days
              </option>

              <option value="30d">
                Last 30 days
              </option>

              <option value="90d">
                Last 90 days
              </option>

              <option value="this_month">
                This month
              </option>
            </select>
          </label>

          <label className="csv-nps-filter-field">
            <span>Bucket</span>

            <select
              value={bucketFilter}
              onChange={(event) =>
                setBucketFilter(event.target.value)
              }
            >
              <option value="all">
                All
              </option>

              <option value="promoter">
                Promoters
              </option>

              <option value="passive">
                Passives
              </option>

              <option value="detractor">
                Detractors
              </option>
            </select>
          </label>

          <label className="csv-nps-filter-field">
            <span>Chart granularity</span>

            <select
              value={chartGranularity}
              onChange={(event) => {
                setChartGranularity(event.target.value);
                setSelectedChartPoint(null);
              }}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </label>

          <div className="csv-nps-filter-field">
            <span>Workspace actions</span>

            <div className="flex flex-wrap gap-2">
              <a
                className="text-link"
                href="/workspace/responses"
              >
                Review responses
              </a>

              <span className="text-slate-500">·</span>

              <a
                className="text-link"
                href="/workspace/closing-the-loop"
              >
                Manage follow-up
              </a>
            </div>
          </div>
        </div>

        <div className="csv-nps-responses-header">
          <div>
            <h2>Summary</h2>

            <p>
              Based on {summary.total} valid NPS
              response
              {summary.total === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        <div className="csv-nps-metric-grid">
          <MetricCard
            label="Responses"
            value={summary.total}
          />

          <MetricCard
            label="NPS"
            value={summary.nps}
          />

          <MetricCard
            label="Promoters"
            value={summary.promoters}
          />

          <MetricCard
            label="Passives"
            value={summary.passives}
          />

          <MetricCard
            label="Detractors"
            value={summary.detractors}
          />

          <MetricCard
            label="Avg. score"
            value={summary.averageScore}
          />

          <MetricCard
            label="Active follow-ups"
            value={closeLoopSummary.active}
          />

          <MetricCard
            label="Active detractors"
            value={
              closeLoopSummary.activeDetractors
            }
          />
        </div>

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <div className="csv-nps-responses-header">
            <div>
              <h3>NPS over time</h3>

              <p>
                Overall NPS trend and response volume using the selected period,
                bucket and chart granularity filters.
              </p>
            </div>
          </div>

          {chartPoints.length === 0 ? (
            <div className="csv-nps-empty-state">
              No usable response dates were detected for this filter set.
            </div>
          ) : (
            <>
              <div className="csv-nps-chart-canvas">
                <NpsTimeseriesChart
                  points={chartPoints}
                  granularity={chartGranularity}
                  onPointClick={(point) => setSelectedChartPoint(point)}
                />
              </div>

              <div className="csv-nps-metric-grid csv-nps-metric-grid-compact">
                <MetricCard
                  label="Responses in chart"
                  value={chartTotals.totalResponses}
                />

                <MetricCard
                  label="Latest NPS point"
                  value={chartTotals.latestNps}
                />

                <MetricCard
                  label="Latest period"
                  value={chartTotals.latestDate || "—"}
                />

                <MetricCard
                  label="Data points"
                  value={chartTotals.points}
                />
              </div>
            </>
          )}
        </section>

        {selectedChartPoint && (
          <section className="csv-nps-chart-card csv-nps-chart-card-wide">
            <div className="csv-nps-responses-header">
              <div>
                <h3>Responses for {selectedChartPoint.date}</h3>

                <p>
                  {selectedChartResponses.length} response
                  {selectedChartResponses.length === 1 ? "" : "s"} in this selected
                  chart period.
                </p>
              </div>

              <button
                type="button"
                className="csv-nps-button csv-nps-button-secondary"
                onClick={() => setSelectedChartPoint(null)}
              >
                Close
              </button>
            </div>

            {selectedChartResponses.length === 0 ? (
              <div className="csv-nps-empty-state">
                No responses found for this chart point.
              </div>
            ) : (
              <div className="csv-nps-table-wrap">
                <table className="csv-nps-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Bucket</th>
                      <th>Contact</th>
                      <th>Comment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedChartResponses.slice(0, 30).map((row) => (
                      <tr key={row.response_id || row.id}>
                        <td>{formatCompactDate(row.submitted_at)}</td>
                        <td>{row.score ?? "—"}</td>
                        <td>{formatBucketLabel(row.bucket)}</td>
                        <td>{row.contact_label || row.contact_name || "Contact"}</td>
                        <td>
                          {truncateText(
                            row.q_recommend_comment ||
                              row.q_final_comment ||
                              row.comment ||
                              "",
                            120
                          )}
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-2">
                            <a
                              className="text-link"
                              href={`/workspace/responses?response=${encodeURIComponent(
                                row.response_id || row.id || ""
                              )}`}
                            >
                              View details
                            </a>

                            <a
                              className="text-link"
                              href={`/workspace/closing-the-loop?response=${encodeURIComponent(
                                row.db_row_id ||
                                  row.dataset_row_id ||
                                  row.response_id ||
                                  row.id ||
                                  ""
                              )}`}
                            >
                              Manage follow-up
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {chartPoints.length > 0 && (
          <section className="csv-nps-chart-card csv-nps-chart-card-wide">
            <NpsBucketStackedColumns
              points={chartPoints}
              granularity={chartGranularity}
              height={220}
              maxBars={36}
              title="Score split over time"
              subtitle="Promoters, passives and detractors across the same selected filters."
            />
          </section>
        )}

        <div className="csv-nps-performance-grid">
          <section className="csv-nps-chart-card">
            <h3>Response mix</h3>

            <p>
              Split of responses across promoters,
              passives and detractors.
            </p>

            <div className="csv-nps-bucket-bars">
              <BucketBar
                label="Promoters"
                count={summary.promoters}
                percentage={
                  bucketPercentages.promoters
                }
                bucket="promoter"
              />

              <BucketBar
                label="Passives"
                count={summary.passives}
                percentage={
                  bucketPercentages.passives
                }
                bucket="passive"
              />

              <BucketBar
                label="Detractors"
                count={summary.detractors}
                percentage={
                  bucketPercentages.detractors
                }
                bucket="detractor"
              />
            </div>
          </section>

          <section className="csv-nps-chart-card">
            <h3>Score distribution</h3>

            <p>
              Number of responses received for each
              score from 0 to 10.
            </p>

            <div className="csv-nps-score-chart">
              {scoreDistribution.map((item) => (
                <div
                  className="csv-nps-score-row"
                  key={item.score}
                >
                  <span className="csv-nps-score-label">
                    {item.score}
                  </span>

                  <div className="csv-nps-score-track">
                    <div
                      className={`csv-nps-score-fill ${getScoreClass(
                        item.score
                      )}`}
                      style={{
                        width: `${item.percentageOfMax}%`,
                      }}
                    />
                  </div>

                  <span className="csv-nps-score-count">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {questionScores.length > 0 && (
          <section className="csv-nps-chart-card csv-nps-chart-card-wide">
            <div className="csv-nps-responses-header">
              <div>
                <h3>
                  Average score by question
                </h3>

                <p>
                  Average rating out of 10 for each
                  survey question. The recommendation
                  question is also used to calculate the
                  headline NPS result.
                </p>
              </div>
            </div>

            <div className="csv-nps-question-score-list">
              {questionScores.map((item) => (
                <QuestionScoreBar
                  key={
                    item.questionId ||
                    item.question
                  }
                  question={item.question}
                  averageScore={
                    item.averageScore
                  }
                  responses={item.responses}
                  isNpsQuestion={
                    item.isNpsQuestion
                  }
                />
              ))}
            </div>
          </section>
        )}

        <section className="csv-nps-chart-card csv-nps-chart-card-wide">
          <h3>Timeline</h3>

          <p>
            NPS and response volume across the selected
            reporting periods, where usable response
            dates were detected.
          </p>

          {timeline.length === 0 ? (
            <div className="csv-nps-empty-state">
              No usable response dates were detected in
              this dataset.
            </div>
          ) : (
            <div className="csv-nps-table-wrap">
              <table className="csv-nps-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Responses</th>
                    <th>NPS</th>
                    <th>Promoters</th>
                    <th>Passives</th>
                    <th>Detractors</th>
                  </tr>
                </thead>

                <tbody>
                  {timeline.map((day) => (
                    <tr key={day.date}>
                      <td>{day.date}</td>
                      <td>{day.total}</td>
                      <td>{day.nps ?? "—"}</td>
                      <td>{day.promoters}</td>
                      <td>{day.passives}</td>
                      <td>{day.detractors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {datasetId && mode === "saved" && (
          <DatasetAiInsights
            datasetId={datasetId}
          />
        )}
      </section>
    </main>
  );
}

function normaliseWorkspacePerformanceDataset(
  apiResponse
) {
  const dataset = apiResponse.dataset || {};
  const summary = apiResponse.summary || {};

  const timeline = Array.isArray(
    apiResponse.timeline
  )
    ? apiResponse.timeline
    : [];

  const scoreDistribution = Array.isArray(
    apiResponse.score_distribution
  )
    ? apiResponse.score_distribution
    : [];

  return {
    id: dataset.id,
    datasetName: dataset.dataset_name,
    sourceType: dataset.source_type,
    content_id: dataset.content_id,
    rawRowCount: dataset.raw_row_count,
    validRowCount: dataset.valid_row_count,
    skippedRowCount: dataset.skipped_row_count,

    summary: {
      total: summary.total ?? 0,
      promoters: summary.promoters ?? 0,
      passives: summary.passives ?? 0,
      detractors: summary.detractors ?? 0,
      nps: summary.nps ?? null,
      averageScore:
        summary.averageScore ??
        summary.average_score ??
        null,
    },

    timeline,
    scoreDistribution,
    questionScores: [],
    rows: [],
  };
}

function normaliseWorkspaceIntercomPerformanceDataset(
  apiResponse
) {
  const dataset = apiResponse.dataset || {};
  const performance =
    apiResponse.performance || {};

  const source =
    apiResponse.source ||
    performance.source ||
    {};

  const rows = Array.isArray(apiResponse.rows)
    ? apiResponse.rows.map((row) => ({
        ...row,

        closeLoopActions:
          row.closeLoopActions ||
          row.close_loop_actions ||
          [],
      }))
    : [];

  const summary = performance.summary || {};

  const timeline = Array.isArray(
    performance.timeseries
  )
    ? performance.timeseries.map((point) => ({
        date: point.date,
        total: point.responses ?? 0,
        responses: point.responses ?? 0,
        promoters: point.promoters ?? 0,
        passives: point.passives ?? 0,
        detractors: point.detractors ?? 0,
        nps: point.nps ?? null,
        averageScore:
          point.average_score ?? null,
      }))
    : [];

  const scoreDistribution = Array.isArray(
    performance.score_distribution
  )
    ? performance.score_distribution.map(
        (item) => ({
          score: item.score,
          count: item.count ?? 0,
          percentage:
            item.percentage ?? 0,
          bucket: item.bucket || null,
        })
      )
    : [];

  const questionScores = Array.isArray(
    performance.question_scores
  )
    ? performance.question_scores.map(
        (item) => ({
          questionId:
            item.question_id || null,

          question:
            item.question ||
            "Survey question",

          responses:
            item.responses ?? 0,

          averageScore:
            item.average_score ?? null,

          isNpsQuestion:
            String(
              item.question_id || ""
            ) === "612560",
        })
      )
    : [];

  const benefits = Array.isArray(
    performance.benefits
  )
    ? performance.benefits
    : [];

  const recentDetractors = Array.isArray(
    performance.recent_detractors
  )
    ? performance.recent_detractors
    : [];

  return {
    id: dataset.id || null,

    datasetName:
      dataset.dataset_name ||
      source.source_name ||
      "Workspace Intercom dataset",

    sourceType:
      dataset.source_type ||
      "workspace_intercom",

    content_id:
      performance.content_id ||
      dataset.content_id ||
      source.survey_content_id ||
      null,

    rawRowCount:
      performance?.data_quality
        ?.canonical_rows_in_period ??
      summary.total ??
      rows.length,

    validRowCount:
      summary.validResponses ??
      summary.total ??
      rows.length,

    skippedRowCount:
      performance?.data_quality
        ?.responses_without_valid_score ??
      0,

    rows,

    summary: {
      total: summary.total ?? 0,

      validResponses:
        summary.validResponses ??
        summary.total ??
        0,

      promoters: summary.promoters ?? 0,
      passives: summary.passives ?? 0,
      detractors: summary.detractors ?? 0,
      nps: summary.nps ?? null,

      averageScore:
        summary.averageScore ??
        summary.average_score ??
        null,

      latestSubmittedAt:
        summary.latestSubmittedAt ??
        summary.latest_submitted_at ??
        null,
    },

    period: performance.period || null,
    comparison:
      performance.comparison || null,

    timeline,
    scoreDistribution,
    questionScores,
    benefits,
    recentDetractors,

    dataQuality:
      performance.data_quality || null,
  };
}

function normaliseSessionDataset(
  sessionDataset
) {
  const rows = Array.isArray(
    sessionDataset?.rows
  )
    ? sessionDataset.rows
    : [];

  const summary = normaliseSummary(
    sessionDataset?.summary,
    rows
  );

  const byDate = new Map();

  rows.forEach((row) => {
    if (!row.submitted_at) return;

    const dateKey = String(
      row.submitted_at
    ).slice(0, 10);

    if (!dateKey) return;

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, {
        date: dateKey,
        total: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        nps: null,
      });
    }

    const bucket = byDate.get(dateKey);

    bucket.total += 1;

    if (row.bucket === "promoter") {
      bucket.promoters += 1;
    }

    if (row.bucket === "passive") {
      bucket.passives += 1;
    }

    if (row.bucket === "detractor") {
      bucket.detractors += 1;
    }

    bucket.nps = Math.round(
      ((bucket.promoters -
        bucket.detractors) /
        bucket.total) *
        100
    );
  });

  const scoreDistribution = Array.from(
    { length: 11 },
    (_, score) => ({
      score,
      count: 0,
    })
  );

  rows.forEach((row) => {
    const score = normaliseNpsScore(
      row.score
    );

    if (Number.isInteger(score)) {
      scoreDistribution[score].count += 1;
    }
  });

  return {
    id: sessionDataset?.id || null,

    datasetName:
      sessionDataset?.datasetName ||
      "Session dataset",

    sourceType:
      sessionDataset?.sourceType ||
      "session",

    content_id:
      sessionDataset?.content_id ||
      null,

    rawRowCount:
      sessionDataset?.rawRowCount ||
      rows.length,

    validRowCount:
      sessionDataset?.validRowCount ||
      rows.length,

    skippedRowCount:
      sessionDataset?.skippedRowCount ||
      0,

    summary,
    rows,

    timeline: Array.from(
      byDate.values()
    ).sort((a, b) =>
      a.date > b.date ? 1 : -1
    ),

    scoreDistribution,
    questionScores: [],
  };
}

function normaliseSummary(
  summaryJson,
  rows
) {
  const summary = summaryJson || {};

  return {
    total:
      summary.total ??
      rows.length,

    promoters:
      summary.promoters ??
      rows.filter(
        (row) =>
          row.bucket === "promoter"
      ).length,

    passives:
      summary.passives ??
      rows.filter(
        (row) =>
          row.bucket === "passive"
      ).length,

    detractors:
      summary.detractors ??
      rows.filter(
        (row) =>
          row.bucket === "detractor"
      ).length,

    nps:
      summary.nps ??
      calculateNps(rows),

    averageScore:
      summary.averageScore ??
      summary.average_score ??
      calculateAverageScore(rows),
  };
}

function normaliseNpsScore(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  if (score < 0 || score > 10) {
    return null;
  }

  return score;
}

function calculateNps(rows) {
  const validRows = (
    Array.isArray(rows)
      ? rows
      : []
  )
    .map((row) => ({
      ...row,

      normalisedScore:
        normaliseNpsScore(row?.score),
    }))
    .filter(
      (row) =>
        row.normalisedScore !== null
    );

  const total = validRows.length;

  if (!total) {
    return null;
  }

  const promoters = validRows.filter(
    (row) =>
      row.normalisedScore >= 9
  ).length;

  const detractors = validRows.filter(
    (row) =>
      row.normalisedScore <= 6
  ).length;

  return Math.round(
    ((promoters - detractors) /
      total) *
      100
  );
}

function calculateAverageScore(rows) {
  const scores = (
    Array.isArray(rows)
      ? rows
      : []
  )
    .map((row) =>
      normaliseNpsScore(row?.score)
    )
    .filter(
      (score) => score !== null
    );

  if (!scores.length) {
    return null;
  }

  return (
    Math.round(
      (scores.reduce(
        (sum, score) =>
          sum + score,
        0
      ) /
        scores.length) *
        10
    ) / 10
  );
}

function MetricCard({
  label,
  value,
}) {
  return (
    <div className="csv-nps-metric-card">
      <div className="csv-nps-metric-label">
        {label}
      </div>

      <div className="csv-nps-metric-value">
        {value ?? "—"}
      </div>
    </div>
  );
}

function BucketBar({
  label,
  count,
  percentage,
  bucket,
}) {
  return (
    <div className="csv-nps-bucket-bar-row">
      <div className="csv-nps-bucket-bar-topline">
        <span>{label}</span>

        <span>
          {count} responses · {percentage}%
        </span>
      </div>

      <div className="csv-nps-bucket-bar-track">
        <div
          className={`csv-nps-bucket-bar-fill csv-nps-bucket-bar-fill-${bucket}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function QuestionScoreBar({
  question,
  averageScore,
  responses,
  isNpsQuestion,
}) {
  const score =
    normaliseNpsScore(averageScore);

  const percentage =
    score === null
      ? 0
      : Math.max(
          0,
          Math.min(100, score * 10)
        );

  return (
    <div className="csv-nps-question-score-row">
      <div className="csv-nps-question-score-header">
        <div>
          <div className="csv-nps-question-score-title">
            {question}
          </div>

          <div className="csv-nps-question-score-meta">
            {responses} response
            {responses === 1 ? "" : "s"}

            {isNpsQuestion && (
              <>
                <span aria-hidden="true">
                  {" "}
                  ·{" "}
                </span>

                <span className="csv-nps-question-score-badge">
                  NPS question
                </span>
              </>
            )}
          </div>
        </div>

        <div className="csv-nps-question-score-value">
          {score === null
            ? "—"
            : score.toFixed(1)}

          <span>/10</span>
        </div>
      </div>

      <div
        className="csv-nps-question-score-track"
        role="progressbar"
        aria-label={`${question}: ${
          score === null
            ? "no score"
            : `${score} out of 10`
        }`}
        aria-valuemin="0"
        aria-valuemax="10"
        aria-valuenow={
          score ?? undefined
        }
      >
        <div
          className="csv-nps-question-score-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function getScoreClass(score) {
  if (score >= 9) {
    return "csv-nps-score-fill-promoter";
  }

  if (score >= 7) {
    return "csv-nps-score-fill-passive";
  }

  return "csv-nps-score-fill-detractor";
}

function rowMatchesPeriod(
  isoDate,
  period
) {
  if (
    !period ||
    period === "all"
  ) {
    return true;
  }

  const submittedAt = new Date(
    isoDate || ""
  );

  if (
    Number.isNaN(
      submittedAt.getTime()
    )
  ) {
    return false;
  }

  const now = new Date();

  if (period === "7d") {
    const threshold = new Date(now);
    threshold.setDate(
      threshold.getDate() - 7
    );

    return submittedAt >= threshold;
  }

  if (period === "30d") {
    const threshold = new Date(now);
    threshold.setDate(
      threshold.getDate() - 30
    );

    return submittedAt >= threshold;
  }

  if (period === "90d") {
    const threshold = new Date(now);
    threshold.setDate(
      threshold.getDate() - 90
    );

    return submittedAt >= threshold;
  }

  if (period === "this_month") {
    return (
      submittedAt.getFullYear() ===
        now.getFullYear() &&
      submittedAt.getMonth() ===
        now.getMonth()
    );
  }

  return true;
}

function summariseRows(rows) {
  const validRows = (
    Array.isArray(rows)
      ? rows
      : []
  )
    .map((row) => ({
      ...row,

      normalisedScore:
        normaliseNpsScore(row?.score),
    }))
    .filter(
      (row) =>
        row.normalisedScore !== null
    );

  const total = validRows.length;

  const promoters = validRows.filter(
    (row) =>
      row.normalisedScore >= 9
  ).length;

  const passives = validRows.filter(
    (row) =>
      row.normalisedScore >= 7 &&
      row.normalisedScore <= 8
  ).length;

  const detractors = validRows.filter(
    (row) =>
      row.normalisedScore <= 6
  ).length;

  const averageScore =
    total > 0
      ? Math.round(
          (validRows.reduce(
            (sum, row) =>
              sum +
              row.normalisedScore,
            0
          ) /
            total) *
            10
        ) / 10
      : null;

  const nps =
    total > 0
      ? Math.round(
          ((promoters -
            detractors) /
            total) *
            100
        )
      : null;

  return {
    total,
    promoters,
    passives,
    detractors,
    nps,
    averageScore,
  };
}

function summariseCloseLoop(rows) {
  const safeRows = Array.isArray(rows)
    ? rows
    : [];

  const withLatestAction =
    safeRows.map((row) => {
      const latestAction =
        getLatestCloseLoopAction(
          row.close_loop_actions ||
            row.closeLoopActions ||
            row.loopActions
        );

      return {
        ...row,
        latestAction,

        currentStatus:
          latestAction?.status || null,
      };
    });

  const withAnyFollowUp =
    withLatestAction.filter(
      (row) => row.latestAction
    );

  const open = withAnyFollowUp.filter(
    (row) =>
      row.currentStatus === "open"
  ).length;

  const inProgress =
    withAnyFollowUp.filter(
      (row) =>
        row.currentStatus ===
        "in_progress"
    ).length;

  const closed =
    withAnyFollowUp.filter(
      (row) =>
        row.currentStatus === "closed"
    ).length;

  const active =
    withAnyFollowUp.filter(
      (row) =>
        row.currentStatus !== "closed"
    ).length;

  const activeDetractors =
    withAnyFollowUp.filter(
      (row) =>
        row.bucket === "detractor" &&
        row.currentStatus !== "closed"
    ).length;

  const untouched =
    safeRows.length -
    withAnyFollowUp.length;

  return {
    open,
    inProgress,
    closed,
    active,
    activeDetractors,
    untouched,

    // Alias retained for older UI references.
    openDetractors:
      activeDetractors,
  };
}

function getLatestCloseLoopAction(
  actions = []
) {
  if (
    !Array.isArray(actions) ||
    actions.length === 0
  ) {
    return null;
  }

  return [...actions].sort(
    (a, b) => {
      const aDate = new Date(
        a.updated_at ||
          a.created_at ||
          a.updatedAt ||
          0
      ).getTime();

      const bDate = new Date(
        b.updated_at ||
          b.created_at ||
          b.updatedAt ||
          0
      ).getTime();

      return bDate - aDate;
    }
  )[0];
}

function buildManagementSummary({
  summary,
  closeLoopSummary,
  periodFilter,
  bucketFilter,
}) {
  const windowLabel =
    formatPeriodLabel(periodFilter);

  const bucketLabel =
    bucketFilter === "all"
      ? "all responses"
      : bucketFilter;

  if (!summary?.total) {
    return `No usable responses are available for ${bucketLabel} in ${windowLabel}.`;
  }

  const detractorPart =
    summary.detractors > 0
      ? `${summary.detractors} detractor${
          summary.detractors === 1
            ? ""
            : "s"
        }`
      : "no detractors";

  const activeFollowUpPart =
    closeLoopSummary.activeDetractors >
    0
      ? `${closeLoopSummary.activeDetractors} active detractor follow-up${
          closeLoopSummary.activeDetractors ===
          1
            ? ""
            : "s"
        }`
      : "no active detractor follow-ups";

  return `For ${bucketLabel} in ${windowLabel}, NPS is ${
    summary.nps ?? "—"
  } from ${summary.total} response${
    summary.total === 1 ? "" : "s"
  }, with ${summary.promoters} promoter${
    summary.promoters === 1 ? "" : "s"
  }, ${summary.passives} passive${
    summary.passives === 1 ? "" : "s"
  } and ${detractorPart}. There are ${activeFollowUpPart}. The immediate management priority is to progress active follow-ups, close any unresolved detractor cases and look for repeated issues in the latest comments.`;
}

function formatPeriodLabel(period) {
  if (period === "7d") {
    return "the last 7 days";
  }

  if (period === "30d") {
    return "the last 30 days";
  }

  if (period === "90d") {
    return "the last 90 days";
  }

  if (period === "this_month") {
    return "this month";
  }

  return "all time";
}

function buildTimeseriesFromRows(rows, granularity = "week") {
  const byPeriod = new Map();

  for (const row of Array.isArray(rows) ? rows : []) {
    const submittedMs = Date.parse(row?.submitted_at || "");

    if (!Number.isFinite(submittedMs)) {
      continue;
    }

    const score = normaliseNpsScore(row?.score);

    if (score === null) {
      continue;
    }

    const date = getChartPeriodKey(submittedMs, granularity);

    const current =
      byPeriod.get(date) || {
        date,
        responses: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        scoreTotal: 0,
        nps: null,
        average_score: null,
      };

    current.responses += 1;
    current.scoreTotal += score;

    if (score >= 9) {
      current.promoters += 1;
    } else if (score >= 7) {
      current.passives += 1;
    } else {
      current.detractors += 1;
    }

    byPeriod.set(date, current);
  }

  return Array.from(byPeriod.values())
    .map((point) => ({
      date: point.date,
      responses: point.responses,
      promoters: point.promoters,
      passives: point.passives,
      detractors: point.detractors,
      nps:
        point.responses > 0
          ? Math.round(
              ((point.promoters - point.detractors) / point.responses) * 100
            )
          : null,
      average_score:
        point.responses > 0
          ? Math.round((point.scoreTotal / point.responses) * 10) / 10
          : null,
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function rowMatchesChartPoint(isoDate, chartDate, granularity = "week") {
  const submittedMs = Date.parse(isoDate || "");

  if (!Number.isFinite(submittedMs)) {
    return false;
  }

  return getChartPeriodKey(submittedMs, granularity) === chartDate;
}

function getChartPeriodKey(ms, granularity = "week") {
  const date = new Date(ms);

  if (granularity === "month") {
    return `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}-01`;
  }

  if (granularity === "week") {
    const day = date.getUTCDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;

    const monday = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate() + diffToMonday
      )
    );

    return ymdUtc(monday.getTime());
  }

  return ymdUtc(ms);
}

function ymdUtc(ms) {
  const date = new Date(ms);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function formatCompactDate(isoDate) {
  if (!isoDate) return "—";

  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatBucketLabel(bucket) {
  if (bucket === "promoter") return "Promoter";
  if (bucket === "passive") return "Passive";
  if (bucket === "detractor") return "Detractor";
  return "Unknown";
}

function truncateText(value, maxLength = 120) {
  const text = String(value || "").trim();

  if (!text) return "—";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
