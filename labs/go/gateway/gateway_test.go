package gateway

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"
)

func deadline(t *testing.T) context.Context {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	t.Cleanup(cancel)
	return ctx
}
func result(t *testing.T, ctx context.Context, ch <-chan error) error {
	t.Helper()
	select {
	case err := <-ch:
		return err
	case <-ctx.Done():
		t.Fatal("worker did not finish")
		return ctx.Err()
	}
}
func TestCapacityAndDrain(t *testing.T) {
	ctx := deadline(t)
	g, _ := New(2)
	release := make(chan struct{})
	started := make(chan struct{}, 2)
	work := func(ctx context.Context) error {
		started <- struct{}{}
		select {
		case <-release:
			return nil
		case <-ctx.Done():
			return ctx.Err()
		}
	}
	first, _ := g.Start(ctx, work)
	second, _ := g.Start(ctx, work)
	<-started
	<-started
	if g.Active() != 2 {
		t.Fatal("wrong active count")
	}
	if _, err := g.Start(ctx, work); !errors.Is(err, ErrCapacity) {
		t.Fatalf("wanted capacity error: %v", err)
	}
	expired, cancel := context.WithCancel(ctx)
	cancel()
	if err := g.Shutdown(expired); !errors.Is(err, context.Canceled) {
		t.Fatalf("shutdown must wait: %v", err)
	}
	if _, err := g.Start(ctx, work); !errors.Is(err, ErrDraining) {
		t.Fatalf("wanted draining: %v", err)
	}
	close(release)
	if err := result(t, ctx, first); err != nil {
		t.Fatal(err)
	}
	if err := result(t, ctx, second); err != nil {
		t.Fatal(err)
	}
	if err := g.Shutdown(ctx); err != nil {
		t.Fatal(err)
	}
	if err := g.Shutdown(ctx); err != nil {
		t.Fatal(err)
	}
	if g.Active() != 0 {
		t.Fatal("capacity leaked")
	}
}
func TestCancellationAndErrorRelease(t *testing.T) {
	for _, mode := range []string{"cancel", "failure"} {
		t.Run(mode, func(t *testing.T) {
			ctx, cancel := context.WithCancel(deadline(t))
			defer cancel()
			g, _ := New(1)
			ch, err := g.Start(ctx, func(ctx context.Context) error {
				if mode == "failure" {
					return errors.New("upstream failure")
				}
				<-ctx.Done()
				return ctx.Err()
			})
			if err != nil {
				t.Fatal(err)
			}
			if mode == "cancel" {
				cancel()
			}
			if result(t, deadline(t), ch) == nil {
				t.Fatal("missing work error")
			}
			if err := g.Shutdown(deadline(t)); err != nil {
				t.Fatal(err)
			}
			if g.Active() != 0 {
				t.Fatal("slot leak")
			}
		})
	}
}
func TestConcurrentAdmissionAndShutdown(t *testing.T) {
	ctx := deadline(t)
	g, _ := New(3)
	var callers sync.WaitGroup
	for range 100 {
		callers.Add(1)
		go func() {
			defer callers.Done()
			ch, err := g.Start(ctx, func(context.Context) error { return nil })
			if err == nil {
				<-ch
			} else if !errors.Is(err, ErrCapacity) && !errors.Is(err, ErrDraining) {
				t.Errorf("unexpected error %v", err)
			}
		}()
	}
	if err := g.Shutdown(ctx); err != nil {
		t.Fatal(err)
	}
	callers.Wait()
	if g.Active() != 0 {
		t.Fatal("work survived shutdown")
	}
}
func TestInvalidInputs(t *testing.T) {
	if _, err := New(0); err == nil {
		t.Fatal("zero limit accepted")
	}
	g, _ := New(1)
	if _, err := g.Start(context.Background(), nil); err == nil {
		t.Fatal("nil worker accepted")
	}
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	if _, err := g.Start(ctx, func(context.Context) error { return nil }); !errors.Is(err, context.Canceled) {
		t.Fatal(err)
	}
}
