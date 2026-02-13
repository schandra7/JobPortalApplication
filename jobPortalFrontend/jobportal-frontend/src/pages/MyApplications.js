import { useEffect, useState } from "react";
import { Container, Card, Button, Spinner, Alert, Badge, Form } from "react-bootstrap";
import { myAppsApi, withdrawApi } from "../api/applicationsApi";
import { useAuth } from "../auth/AuthContext";

export default function MyApplications() {
  const [apps, setApps] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const { userId } = useAuth();

  const load = async () => {
    if (!userId) throw new Error("UserId missing");
    const res = await myAppsApi({ userId });
    setApps(res.data);
    applyFilter(res.data, filter);
  };

  const applyFilter = (list, value) => {
    if (value === "ALL") {
      setFiltered(list);
    } else {
      setFiltered(list.filter((a) => a.status === value));
    }
  };

  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!userId) throw new Error("UserId missing");
        const res = await myAppsApi({ userId });
        if (mounted) {
          setApps(res.data);
          applyFilter(res.data, filter);
        }
      } catch (e) {
        if (mounted) setErr(e.response?.data || e.message || "Failed to load applications");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  
  useEffect(() => {
    applyFilter(apps, filter);
  }, [filter]);

  const onWithdraw = async (applicationId) => {
    if (!window.confirm("Withdraw this application?")) return;
    try {
      await withdrawApi({ applicationId, userId });
      await load();
    } catch (e) {
      alert(e.response?.data || "Withdraw failed");
    }
  };

  return (
    <Container className="py-4">

      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Applications</h3>

        <Form.Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: "200px" }}
        >
          <option value="ALL">All Applications</option>
          <option value="APPLIED">Applied</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </Form.Select>
      </div>

      {err && <Alert variant="danger">{err}</Alert>}

      {loading ? (
        <Spinner />
      ) : (
        <div className="d-grid gap-3">
          {filtered.length === 0 ? (
            <Alert variant="info">No applications found.</Alert>
          ) : (
            filtered.map((a) => (
              <Card key={a.id} className="shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <Card.Title>Application #{a.id}</Card.Title>
                    <Badge bg={a.status === "WITHDRAWN" ? "secondary" : "info"}>
                      {a.status}
                    </Badge>
                  </div>

                  <Card.Text className="mb-1">
                    Job: <b>{a.job?.title}</b> (ID: {a.job?.id})
                  </Card.Text>
                  <small className="text-muted">
                    Location: {a.job?.location || "N/A"} · Apply by: {a.job?.applyDeadline}
                  </small>

                  {a.status !== "WITHDRAWN" && (
                    <div className="mt-3">
                      <Button variant="outline-danger" onClick={() => onWithdraw(a.id)}>
                        Withdraw
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      )}
    </Container>
  );
}