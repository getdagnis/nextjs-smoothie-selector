'use client';
import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import styles from './page.module.css';

interface Flavor {
  name: string;
  quantity: number;
}

const fetchedFlavors: Flavor[] = [
  { name: 'Smelly Sock', quantity: 0 },
  { name: 'Old Sneakers', quantity: 0 },
  { name: 'Rotten Veggies', quantity: 0 },
  { name: 'Sad Salad', quantity: 0 },
];

const INITIAL_QUANTITY = 30;

const Home: NextPage = () => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(INITIAL_QUANTITY);
  const [totalQuantity, setTotalQuantity] = useState<number>(INITIAL_QUANTITY);
  const [flavors, setFlavors] = useState(fetchedFlavors);
  const [countIsValid, setCountIsValid] = useState(false);

  useEffect(() => {
    setSelectedQuantity(INITIAL_QUANTITY);
    handleQuantityChange({ target: { value: String(INITIAL_QUANTITY) } } as React.ChangeEvent<HTMLSelectElement>);
  }, []);

  const handleQuantityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedQuantity = Number(event.target.value);
    setSelectedQuantity(newSelectedQuantity);

    let newFlavors = [];
    let flavorsCount = fetchedFlavors.length;
    let quotient = Math.floor(newSelectedQuantity / flavorsCount);
    let remainder = newSelectedQuantity % flavorsCount;
    for (let i = 0; i < flavorsCount; i++) {
      let quantity = quotient;
      if (i < remainder) {
        quantity++;
      }
      newFlavors.push({ name: fetchedFlavors[i].name, quantity });
    }

    setFlavors(newFlavors);
    setCountIsValid(true);
    setTotalQuantity(newSelectedQuantity);
  };

  const handleSingleChange = (flavorIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFlavors = [...flavors];
    newFlavors[flavorIndex].quantity = Number(event.target.value) > 0 ? Number(event.target.value) : 0;
    setFlavors(newFlavors);
    setCountIsValid(true);

    const totalQuantity = flavors.reduce((sum, flavor) => {
      return sum + flavor.quantity;
    }, 0);

    setTotalQuantity(totalQuantity);

    if (totalQuantity !== selectedQuantity) {
      setCountIsValid(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    alert(`Your ${selectedQuantity} selected smoothies are on their way!`);
  };

  return (
    <main className={styles.main}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="quantity">Select Subscription Quantity:</label>
          <select id="quantity" value={selectedQuantity} onChange={handleQuantityChange}>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </div>

        <h3>Flavors:</h3>
        {flavors.map((flavor, index) => (
          <div key={flavor.name}>
            <label htmlFor={`flavor-${index}`}>{flavor.name}:</label>
            <input id={`flavor-${index}`} type="number" value={flavor.quantity} onChange={handleSingleChange(index)} />
          </div>
        ))}
        {countIsValid ? (
          <div className={styles.submit}>
            <button type="submit">Submit</button>
          </div>
        ) : (
          <div className={styles.submit}>
            <button type="submit" disabled>
              Submit
            </button>
            <p className={styles.error}>Total quantity must be {selectedQuantity}</p>
            <p className={styles.error}>
              {totalQuantity > selectedQuantity && `Please remove ${totalQuantity - selectedQuantity} smoothies`}
              {totalQuantity < selectedQuantity && `Please add ${selectedQuantity - totalQuantity} smoothies`} or{' '}
              <span
                className={styles.reset}
                onClick={() =>
                  handleQuantityChange({
                    target: { value: String(selectedQuantity) },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
              >
                reset
              </span>
            </p>
          </div>
        )}
      </form>
    </main>
  );
};

export default Home;
