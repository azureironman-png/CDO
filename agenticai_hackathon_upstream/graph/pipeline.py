"""LangGraph orchestration for the MDM multi-agent pipeline.

Flow:
  START → requirements (Agent 01)
        → ui (Agent 02, Angular CDE reference)
        → etl (Agent 03)
        → mdm (Agent 04)
        → END

JIRA / business text enters as ``raw_requirement``. Agent 02 evolves the
Angular Customer Data Essentials UI under ``references/cdo_customer_ui``.
"""

from __future__ import annotations

from typing import Any

from langgraph.graph import END, START, StateGraph

from core.state import ProjectState


def _as_state(value: ProjectState | dict[str, Any]) -> ProjectState:
    if isinstance(value, ProjectState):
        return value
    return ProjectState.model_validate(value)


def requirements_node(state: ProjectState | dict[str, Any]) -> dict[str, Any]:
    from agents.agent_01_requirements import run_requirements_agent

    updated = run_requirements_agent(_as_state(state))
    return updated.model_dump()


def ui_node(state: ProjectState | dict[str, Any]) -> dict[str, Any]:
    from agents.agent_02_ui import run_ui_agent

    updated = run_ui_agent(_as_state(state))
    return updated.model_dump()


def etl_node(state: ProjectState | dict[str, Any]) -> dict[str, Any]:
    from agents.agent_03_etl import run_etl_agent

    updated = run_etl_agent(_as_state(state))
    return updated.model_dump()


def mdm_node(state: ProjectState | dict[str, Any]) -> dict[str, Any]:
    from agents.agent_04_mdm import run_mdm_agent

    updated = run_mdm_agent(_as_state(state))
    return updated.model_dump()


def build_mdm_pipeline():
    """Compile the LangGraph StateGraph for Agents 01→02→03→04."""
    graph = StateGraph(ProjectState)
    graph.add_node("requirements", requirements_node)
    graph.add_node("ui", ui_node)
    graph.add_node("etl", etl_node)
    graph.add_node("mdm", mdm_node)

    graph.add_edge(START, "requirements")
    graph.add_edge("requirements", "ui")
    graph.add_edge("ui", "etl")
    graph.add_edge("etl", "mdm")
    graph.add_edge("mdm", END)

    return graph.compile()


def get_mdm_pipeline():
    """Return a compiled pipeline (lazy singleton)."""
    global _PIPELINE
    if _PIPELINE is None:
        _PIPELINE = build_mdm_pipeline()
    return _PIPELINE


_PIPELINE = None


def run_mdm_pipeline(raw_requirement: str) -> ProjectState:
    """Convenience runner: JIRA/business requirement → full agent pipeline."""
    result = get_mdm_pipeline().invoke(
        ProjectState(raw_requirement=raw_requirement)
    )
    return _as_state(result)
