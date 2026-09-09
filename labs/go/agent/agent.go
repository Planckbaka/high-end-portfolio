// Package agent is an original reduced teaching loop informed by pi-go/pi-mono.
// It intentionally does not implement their complete event or wire protocol.
package agent

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
)

type Message struct{ Role, Text, CallID string }
type Call struct {
	ID, Name  string
	Arguments json.RawMessage
}
type Response struct {
	Text string
	Call *Call
}
type Model func(context.Context, []Message) (Response, error)
type Tool func(context.Context, json.RawMessage) (string, error)
type Event struct{ Kind, CallID string }
type Result struct {
	Messages []Message
	Events   []Event
}

var ErrStepLimit = errors.New("model step limit reached")

// region:loop
func Run(ctx context.Context, model Model, tools map[string]Tool, prompt string, maxSteps int) (result Result, err error) {
	result.Messages = []Message{{Role: "user", Text: prompt}}
	result.Events = append(result.Events, Event{Kind: "start"})
	defer func() {
		kind := "complete"
		if err != nil {
			kind = "failed"
		}
		result.Events = append(result.Events, Event{Kind: kind})
	}()
	if maxSteps < 1 || model == nil {
		return result, errors.New("positive step limit and model required")
	}
	seen := make(map[string]bool)
	for range maxSteps {
		if err = ctx.Err(); err != nil {
			return
		}
		var response Response
		response, err = model(ctx, append([]Message(nil), result.Messages...))
		if err != nil {
			return
		}
		if err = ctx.Err(); err != nil {
			return
		}
		if response.Call == nil {
			result.Messages = append(result.Messages, Message{Role: "assistant", Text: response.Text})
			return
		}
		call := response.Call
		if call.ID == "" || call.Name == "" || seen[call.ID] {
			return result, errors.New("empty or duplicate tool call identity")
		}
		seen[call.ID] = true
		result.Messages = append(result.Messages, Message{Role: "assistant", Text: call.Name, CallID: call.ID})
		result.Events = append(result.Events, Event{Kind: "tool_start", CallID: call.ID})
		tool, ok := tools[call.Name]
		var output string
		var toolErr error
		if !ok {
			toolErr = fmt.Errorf("unknown tool: %s", call.Name)
		} else {
			output, toolErr = tool(ctx, call.Arguments)
		}
		if err = ctx.Err(); err != nil {
			return
		}
		if toolErr != nil {
			output = "Tool error: " + toolErr.Error()
		}
		result.Messages = append(result.Messages, Message{Role: "tool", Text: output, CallID: call.ID})
		result.Events = append(result.Events, Event{Kind: "tool_end", CallID: call.ID})
	}
	return result, ErrStepLimit
}

// endregion:loop

// Add is deliberately pure: no filesystem, network, or shell side effects.
func Add(ctx context.Context, raw json.RawMessage) (string, error) {
	if err := ctx.Err(); err != nil {
		return "", err
	}
	var args struct {
		A *int `json:"a"`
		B *int `json:"b"`
	}
	decoder := json.NewDecoder(bytes.NewReader(raw))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&args); err != nil {
		return "", err
	}
	if args.A == nil || args.B == nil {
		return "", errors.New("a and b are required integers")
	}
	var extra any
	if decoder.Decode(&extra) != io.EOF {
		return "", errors.New("expected one JSON object")
	}
	// Bound the teaching tool's arithmetic domain to avoid platform overflow.
	if *args.A < -1000000 || *args.A > 1000000 || *args.B < -1000000 || *args.B > 1000000 {
		return "", errors.New("arguments outside teaching range")
	}
	return fmt.Sprint(*args.A + *args.B), nil
}
