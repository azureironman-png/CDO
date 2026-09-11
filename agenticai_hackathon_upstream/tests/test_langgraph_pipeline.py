"""Unit tests for LangGraph pipeline wiring (no LLM calls)."""

from graph.pipeline import build_mdm_pipeline


def test_langgraph_pipeline_compiles():
    graph = build_mdm_pipeline()
    assert graph is not None


def test_langgraph_pipeline_node_order():
    graph = build_mdm_pipeline()
    g = graph.get_graph()
    node_ids = set(g.nodes.keys())
    for expected in {"requirements", "ui", "etl", "mdm", "__start__", "__end__"}:
        assert expected in node_ids


def test_langgraph_edges_requirements_to_ui():
    graph = build_mdm_pipeline()
    edges = {(e.source, e.target) for e in graph.get_graph().edges}
    assert ("__start__", "requirements") in edges
    assert ("requirements", "ui") in edges
    assert ("ui", "etl") in edges
    assert ("etl", "mdm") in edges
    assert ("mdm", "__end__") in edges
