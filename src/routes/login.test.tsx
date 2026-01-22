// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Mock auth client
const mockUseSession = vi.fn(() => ({
  data: null,
  isPending: false,
}));
vi.mock("../lib/auth", () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
  useSession: () => mockUseSession(),
}));

// Mock TanStack Router
const mockSearchParams: { redirect?: string; template?: string } = {
  redirect: undefined,
  template: undefined,
};
const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  useSearch: () => mockSearchParams,
  useNavigate: () => mockNavigate,
}));

import { authClient } from "../lib/auth";
import { Login } from "./login";

describe("Login Route", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockSearchParams.redirect = undefined;
    mockSearchParams.template = undefined;
  });

  it("renders login button", () => {
    render(<Login />);
    expect(screen.getByText(/Sign in with Google/i)).toBeDefined();
  });

  it("calls sign in with callback URL when button clicked", async () => {
    render(<Login />);
    const button = screen.getByText(/Sign in with Google/i).closest("button");
    if (button) fireEvent.click(button);
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/auth/callback",
    });
  });

  it("includes redirect param in callback URL when provided", async () => {
    mockSearchParams.redirect = "/dashboard";
    render(<Login />);
    const button = screen.getByText(/Sign in with Google/i).closest("button");
    if (button) fireEvent.click(button);
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/auth/callback?redirect=%2Fdashboard",
    });
  });

  it("includes template redirect in callback URL when template param provided", async () => {
    mockSearchParams.template = "classic";
    render(<Login />);
    const button = screen.getByText(/Sign in with Google/i).closest("button");
    if (button) fireEvent.click(button);
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/auth/callback?redirect=%2Fbuilder%3Ftemplate%3Dclassic",
    });
  });

  it("prefers redirect over template when both provided", async () => {
    mockSearchParams.redirect = "/custom";
    mockSearchParams.template = "classic";
    render(<Login />);
    const button = screen.getByText(/Sign in with Google/i).closest("button");
    if (button) fireEvent.click(button);
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/auth/callback?redirect=%2Fcustom",
    });
  });
});
