package agent

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
)

func scripted(responses ...Response) Model {
	index := 0
	return func(context.Context, []Message) (Response, error) {
		if index >= len(responses) {
			return Response{}, errors.New("script exhausted")
		}
		r := responses[index]
		index++
		return r, nil
	}
}
func TestToolRoundTrip(t *testing.T) {
	model := scripted(Response{Call: &Call{ID: "1", Name: "add", Arguments: json.RawMessage(`{"a":2,"b":3}`)}}, Response{Text: "5"})
	result, err := Run(context.Background(), model, map[string]Tool{"add": Add}, "add", 3)
	if err != nil {
		t.Fatal(err)
	}
	if len(result.Messages) != 4 || result.Messages[2].Text != "5" || result.Messages[2].CallID != "1" {
		t.Fatalf("wrong transcript %#v", result)
	}
	if len(result.Events) != 4 || result.Events[3].Kind != "complete" {
		t.Fatal(result.Events)
	}
}
func TestInvalidArgumentsBecomeRecoverableResults(t *testing.T) {
	for _, raw := range []string{`{bad`, `{"a":1}`, `{"a":1,"b":2,"extra":3}`, `{"a":1,"b":2} {}`, `{"a":null,"b":2}`} {
		t.Run(raw, func(t *testing.T) {
			model := scripted(Response{Call: &Call{ID: "1", Name: "add", Arguments: json.RawMessage(raw)}}, Response{Text: "corrected explanation"})
			result, err := Run(context.Background(), model, map[string]Tool{"add": Add}, "test", 2)
			if err != nil {
				t.Fatal(err)
			}
			if result.Messages[2].Text[:10] != "Tool error" {
				t.Fatal(result)
			}
		})
	}
}
func TestFailureBoundaries(t *testing.T) {
	t.Run("unknown tool", func(t *testing.T) {
		r, e := Run(context.Background(), scripted(Response{Call: &Call{ID: "1", Name: "missing"}}, Response{Text: "done"}), nil, "", 2)
		if e != nil || r.Messages[2].Role != "tool" {
			t.Fatal(r, e)
		}
	})
	t.Run("model failure", func(t *testing.T) {
		r, e := Run(context.Background(), scripted(), nil, "", 2)
		if e == nil || len(r.Messages) != 1 || r.Events[len(r.Events)-1].Kind != "failed" {
			t.Fatal(r, e)
		}
	})
	t.Run("limit", func(t *testing.T) {
		_, e := Run(context.Background(), scripted(Response{Call: &Call{ID: "1", Name: "missing"}}), nil, "", 1)
		if !errors.Is(e, ErrStepLimit) {
			t.Fatal(e)
		}
	})
	t.Run("duplicate", func(t *testing.T) {
		call := Response{Call: &Call{ID: "1", Name: "missing"}}
		_, e := Run(context.Background(), scripted(call, call), nil, "", 3)
		if e == nil {
			t.Fatal("duplicate accepted")
		}
	})
	t.Run("cancel after model", func(t *testing.T) {
		ctx, cancel := context.WithCancel(context.Background())
		called := false
		model := func(context.Context, []Message) (Response, error) {
			cancel()
			return Response{Call: &Call{ID: "1", Name: "tool"}}, nil
		}
		_, e := Run(ctx, model, map[string]Tool{"tool": func(context.Context, json.RawMessage) (string, error) { called = true; return "", nil }}, "", 3)
		if !errors.Is(e, context.Canceled) || called {
			t.Fatal(e, called)
		}
	})
	t.Run("cancel inside tool", func(t *testing.T) {
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()
		tool := func(context.Context, json.RawMessage) (string, error) { cancel(); return "late", nil }
		r, e := Run(ctx, scripted(Response{Call: &Call{ID: "1", Name: "tool"}}), map[string]Tool{"tool": tool}, "", 2)
		if !errors.Is(e, context.Canceled) || len(r.Messages) != 2 {
			t.Fatal(r, e)
		}
	})
}
