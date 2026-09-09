// Package gateway is a teaching admission gate inspired by go-review's gateway.
package gateway

import (
	"context"
	"errors"
	"sync"
)

var ErrCapacity = errors.New("capacity exhausted")
var ErrDraining = errors.New("gate is draining")

type Gate struct {
	mu            sync.Mutex
	limit, active int
	draining      bool
	done          chan struct{}
}

func New(limit int) (*Gate, error) {
	if limit < 1 {
		return nil, errors.New("limit must be positive")
	}
	return &Gate{limit: limit, done: make(chan struct{})}, nil
}

// Start acquires capacity before creating work. The caller owns cancellation.
// region:admission
func (g *Gate) Start(ctx context.Context, work func(context.Context) error) (<-chan error, error) {
	if work == nil {
		return nil, errors.New("nil work")
	}
	g.mu.Lock()
	defer g.mu.Unlock()
	if err := ctx.Err(); err != nil {
		return nil, err
	}
	if g.draining {
		return nil, ErrDraining
	}
	if g.active == g.limit {
		return nil, ErrCapacity
	}
	g.active++
	result := make(chan error, 1)
	go func() {
		defer func() {
			g.mu.Lock()
			g.active--
			if g.draining && g.active == 0 {
				close(g.done)
			}
			g.mu.Unlock()
			close(result)
		}()
		result <- work(ctx)
	}()
	return result, nil
}

// endregion:admission

// Shutdown stops admission and waits for workers. A timeout does not kill work.
// region:shutdown
func (g *Gate) Shutdown(ctx context.Context) error {
	g.mu.Lock()
	if !g.draining {
		g.draining = true
		if g.active == 0 {
			close(g.done)
		}
	}
	g.mu.Unlock()
	select {
	case <-g.done:
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// endregion:shutdown

func (g *Gate) Active() int { g.mu.Lock(); defer g.mu.Unlock(); return g.active }
