import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge } from "react-bootstrap";
import { getPublishedJobsApi } from "../api/jobsApi";
import { applyApi } from "../api/applicationsApi";
import { useAuth } from "../auth/AuthContext";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const { token, role, userId } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await getPublishedJobsApi();
        setJobs(res.data);
      } catch {
        setErr("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onApply = async (jobId) => {
    if (!userId) return alert("UserId missing. Please login again.");
    try {
      await applyApi({ jobId, userId });
      alert("Applied successfully!");
    } catch (e) {
      alert(e.response?.data || "Apply failed");
    }
  };

  return (
    <Container className="py-4">
      <h3 className="mb-3">Job Listings</h3>
      {err && <Alert variant="danger">{err}</Alert>}
      {loading ? (
        <Spinner />
      ) : (
        <div className="d-grid gap-3">
          {jobs.map((j) => (
            <Card key={j.id} className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <Card.Title>{j.title}</Card.Title>
                  <Badge bg={j.isPublished ? "success" : "secondary"}>
                    {j.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                </div>
                <Card.Text className="mb-1">{j.description}</Card.Text>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Location: {j.location || "N/A"} · Apply by: {j.applyDeadline}
                  </small>
                  {token && role === "EMPLOYEE" && j.isPublished && (
                    <Button onClick={() => onApply(j.id)}>Apply</Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}